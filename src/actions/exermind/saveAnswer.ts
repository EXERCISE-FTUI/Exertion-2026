"use server";

import type { ActionResult, ExamState } from "@/lib/exermind/types";
import {
  callExamRpc,
  invalidInput,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";

export async function saveAnswer({
  questionId,
  answer,
}: {
  questionId: string;
  answer: string;
}): Promise<ActionResult<ExamState>> {
  if (!questionId || typeof answer !== "string") {
    return invalidInput(
      "EXERMIND_INVALID_INPUT",
      "A question and string answer are required.",
    );
  }

  try {
    const { data, error } = await callExamRpc<ExamState>("save_answer", {
      p_question_id: questionId,
      p_answer: answer,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to save the answer.");
    }

    return {
      success: true,
      data: sanitizeExamState(data),
    };
  } catch (error) {
    return rpcFailure(error, "Failed to save the answer.");
  }
}
