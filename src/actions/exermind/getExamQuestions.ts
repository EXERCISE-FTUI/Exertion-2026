"use server";

import { getExamState } from "@/actions/exermind/getExamState";

/**
 * Compatibility wrapper for older callers. Questions now come exclusively
 * from the authenticated session state, which strips content.hint and prevents
 * callers from probing arbitrary question IDs.
 */
export async function getExamQuestions(questionIds: string[]) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return { success: true as const, questions: [] };
  }

  const result = await getExamState();
  if (!result.success) return result;
  if (!result.data) {
    return {
      success: false as const,
      error: true as const,
      code: "EXERMIND_SESSION_NOT_FOUND",
      message: "No owned exam session exists.",
    };
  }

  const questionMap = new Map(
    result.data.questions.map((question) => [question.id, question]),
  );
  const questions = questionIds.flatMap((questionId) => {
    const question = questionMap.get(questionId);
    return question ? [question] : [];
  });

  return {
    success: true as const,
    questions,
  };
}
