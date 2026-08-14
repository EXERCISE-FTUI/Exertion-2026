"use server";

import { getWarningCount } from "@/actions/exermind/warningCount";
import type { ActionResult, ExamResult, ExamState } from "@/lib/exermind/types";
import {
  callExamRpc,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";
import { isRedisConfigured, redis } from "@/utils/redis";
import { createClient } from "@/utils/supabase/server";

interface SubmitExamData {
  state: ExamState;
  result: ExamResult;
}

type SubmitExamResult = ActionResult<SubmitExamData> & Partial<ExamResult>;

export async function submitExam(): Promise<SubmitExamResult> {
  try {
    const stateResponse = await callExamRpc<ExamState>("get_exam_state");
    const sessionId = stateResponse.data?.session?.id;

    // 1. Flush any high-speed draft answers from Redis into Supabase before submitting
    if (sessionId && isRedisConfigured && redis) {
      try {
        const redisKey = `exermind:drafts:${sessionId}`;
        const drafts = await redis.hgetall<Record<string, string>>(redisKey);

        if (drafts && Object.keys(drafts).length > 0) {
          const supabase = await createClient();

          for (const [questionId, answer] of Object.entries(drafts)) {
            if (answer && typeof answer === "string") {
              await supabase
                .schema("exermind_exam")
                .from("session_answers")
                .upsert(
                  {
                    session_id: sessionId,
                    question_id: questionId,
                    answer: answer as any,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "session_id, question_id" },
                );
            }
          }
        }
      } catch (flushErr) {
        console.error("Failed to flush Redis drafts prior to submission:", flushErr);
      }
    }

    const warningResponse = sessionId
      ? await getWarningCount({
          sessionId,
        })
      : null;

    const { data, error } = await callExamRpc<SubmitExamData>("submit_exam", {
      p_warning_count: warningResponse?.warningCount ?? null,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to submit the exam.");
    }

    // Clean up Redis draft key upon successful submission
    if (sessionId && isRedisConfigured && redis) {
      try {
        await redis.del(`exermind:drafts:${sessionId}`);
      } catch (delErr) {
        console.error("Failed to clean up Redis drafts:", delErr);
      }
    }

    const normalizedData = {
      ...data,
      state: sanitizeExamState(data.state),
    };

    return {
      success: true,
      data: normalizedData,
      ...normalizedData.result,
    };
  } catch (error) {
    return rpcFailure(error, "Failed to submit the exam.");
  }
}
