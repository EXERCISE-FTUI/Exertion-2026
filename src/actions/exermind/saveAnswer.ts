"use server";

import type { ActionResult, ExamState } from "@/lib/exermind/types";
import {
  callExamRpc,
  invalidInput,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";
import { isRedisConfigured, redis } from "@/utils/redis";
import { EXERMIND_CONFIG } from "@/config/exermind.config";

export async function saveAnswer({
  sessionId: providedSessionId,
  questionId,
  answer,
}: {
  sessionId?: string;
  questionId: string;
  answer: string;
}): Promise<ActionResult<ExamState | null>> {
  if (!questionId || typeof answer !== "string") {
    return invalidInput(
      "EXERMIND_INVALID_INPUT",
      "A question and string answer are required.",
    );
  }

  try {
    let sessionId = providedSessionId;
    let state: ExamState | null = null;

    if (!sessionId) {
      const stateRes = await callExamRpc<ExamState>("get_exam_state");
      if (stateRes.error || !stateRes.data) {
        return rpcFailure(stateRes.error, "Failed to locate active session.");
      }
      state = stateRes.data;
      sessionId = state.session.id;
    }

    // 2. High-speed Redis draft answer saving (sub-10ms)
    if (isRedisConfigured && redis && sessionId) {
      try {
        const redisKey = `exermind:drafts:${sessionId}`;
        await redis.hset(redisKey, { [questionId]: answer });
        await redis.expire(redisKey, 7200); // 2-hour TTL
      } catch (redisErr) {
        console.error("Failed to write draft answer to Redis:", redisErr);
      }
    }

    // 3. Save to Supabase RPC ONLY if in locked sequence mode
    if (EXERMIND_CONFIG.LOCKED_SEQUENCE) {
      const { data: dbData, error: dbError } = await callExamRpc<ExamState>("save_answer", {
        p_question_id: questionId,
        p_answer: answer,
      });

      if (dbData && !dbError && Array.isArray(dbData.questions)) {
        state = dbData;
      }
    }

    // 4. Merge Redis drafts into local state answers if Redis is available and state exists
    if (state && isRedisConfigured && redis && sessionId) {
      try {
        const redisKey = `exermind:drafts:${sessionId}`;
        const drafts = await redis.hgetall<Record<string, string>>(redisKey);
        if (drafts) {
          const currentAnswers = state.answers ?? {};
          state = {
            ...state,
            answers: {
              ...currentAnswers,
              ...Object.fromEntries(
                Object.entries(drafts).map(([qId, val]) => [
                  qId,
                  {
                    answer: val,
                    completedAt: currentAnswers[qId]?.completedAt ?? null,
                    isCorrect: currentAnswers[qId]?.isCorrect ?? null,
                    earnedPoints: currentAnswers[qId]?.earnedPoints ?? 0,
                    totalPoints: currentAnswers[qId]?.totalPoints ?? 1,
                    gamePoints: currentAnswers[qId]?.gamePoints ?? 0,
                    multiplier: currentAnswers[qId]?.multiplier ?? 1,
                  },
                ]),
              ),
            },
          };
        }
      } catch (err) {
        console.error("Failed to read Redis drafts in saveAnswer:", err);
      }
    }

    return {
      success: true,
      data: state ? sanitizeExamState(state) : null,
    };
  } catch (error) {
    return rpcFailure(error, "Failed to save the answer.");
  }
}
