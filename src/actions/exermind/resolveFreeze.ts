"use server";

import type { ActionResult, ExamState } from "@/lib/exermind/types";
import {
  callExamRpc,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";

export async function resolveFreeze({
  questionId,
}: {
  questionId?: string;
}): Promise<ActionResult<ExamState>> {
  try {
    const { data, error } = await callExamRpc<ExamState>("resolve_freeze", {
      p_question_id: questionId ?? null,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to resolve time freeze.");
    }

    return {
      success: true,
      data: sanitizeExamState(data),
    };
  } catch (error) {
    return rpcFailure(error, "Failed to resolve time freeze.");
  }
}
