"use server";

import type { ActionResult, ExamState } from "@/lib/exermind/types";
import {
  callExamRpc,
  invalidInput,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";

export async function completeQuestion({
  questionId,
}: {
  questionId: string;
}): Promise<ActionResult<ExamState>> {
  if (!questionId) {
    return invalidInput("EXERMIND_INVALID_INPUT", "A question is required.");
  }

  try {
    const { data, error } = await callExamRpc<ExamState>("complete_question", {
      p_question_id: questionId,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to complete the question.");
    }

    return {
      success: true,
      data: sanitizeExamState(data),
    };
  } catch (error) {
    return rpcFailure(error, "Failed to complete the question.");
  }
}
