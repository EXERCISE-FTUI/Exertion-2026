"use server";

import { getWarningCount } from "@/actions/exermind/warningCount";
import type { ActionResult, ExamResult, ExamState } from "@/lib/exermind/types";
import {
  callExamRpc,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";

interface SubmitExamData {
  state: ExamState;
  result: ExamResult;
}

type SubmitExamResult = ActionResult<SubmitExamData> & Partial<ExamResult>;

export async function submitExam(): Promise<SubmitExamResult> {
  try {
    const stateResponse = await callExamRpc<ExamState>("get_exam_state");
    const warningResponse = stateResponse.data
      ? await getWarningCount({
          sessionId: stateResponse.data.session.id,
        })
      : null;

    const { data, error } = await callExamRpc<SubmitExamData>("submit_exam", {
      p_warning_count: warningResponse?.warningCount ?? null,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to submit the exam.");
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
