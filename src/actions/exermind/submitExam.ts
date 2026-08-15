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

export async function submitExam(clientAnswers?: Record<string, string>): Promise<SubmitExamResult> {
  try {
    const stateResponse = await callExamRpc<ExamState>("get_exam_state");
    const sessionId = stateResponse.data?.session?.id;
    let redisDrafts: Record<string, string> | null = null;

    // 1. Fetch any high-speed draft answers from Redis before submitting
    if (sessionId && isRedisConfigured && redis) {
      try {
        const redisKey = `exermind:drafts:${sessionId}`;
        redisDrafts = await redis.hgetall<Record<string, string>>(redisKey);
      } catch (flushErr) {
        console.error("Failed to read Redis drafts prior to submission:", flushErr);
      }
    }

    // 2. Merge client answers (browser state) and Redis drafts (Upstash backup)
    const mergedDrafts: Record<string, string> = {
      ...(redisDrafts ?? {}),
      ...(clientAnswers ?? {}),
    };

    const warningResponse = sessionId
      ? await getWarningCount({
          sessionId,
        })
      : null;

    const { data, error } = await callExamRpc<SubmitExamData>("submit_exam", {
      p_warning_count: warningResponse?.warningCount ?? null,
      p_drafts: mergedDrafts,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to submit the exam.");
    }

    // Note: Redis draft keys are intentionally NOT deleted to serve as a backup log

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
