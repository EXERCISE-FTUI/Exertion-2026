"use server";

import type {
  ActionResult,
  ExamSessionState,
  ExamState,
} from "@/lib/exermind/types";
import {
  callExamRpc,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";
import { isRedisConfigured, redis } from "@/utils/redis";

type GetExamStateResult = ActionResult<ExamState | null> & {
  session?: ExamSessionState | null;
  questions?: ExamState["questions"];
};

export async function getExamState(): Promise<GetExamStateResult> {
  try {
    const { data, error } = await callExamRpc<ExamState>("get_exam_state");

    if (error) {
      return rpcFailure(error, "Failed to load the exam state.");
    }

    let state = data ? sanitizeExamState(data) : null;

    // Merge high-speed draft answers from Redis if configured
    if (state && isRedisConfigured && redis && state.session?.id) {
      try {
        const redisKey = `exermind:drafts:${state.session.id}`;
        const drafts = await redis.hgetall<Record<string, string>>(redisKey);

        if (drafts && Object.keys(drafts).length > 0) {
          const currentAnswers = state.answers;
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
      } catch (redisErr) {
        console.error("Failed to merge Redis drafts in getExamState:", redisErr);
      }
    }

    return {
      success: true,
      data: state,
      session: state?.session ?? null,
      questions: state?.questions ?? [],
    };
  } catch (error) {
    return rpcFailure(error, "Failed to load the exam state.");
  }
}
