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

    const state = data ? sanitizeExamState(data) : null;
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
