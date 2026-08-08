"use server";

import { validatePowerUpSelection } from "@/lib/exermind/powerUps";
import type {
  ActionResult,
  ExamSessionState,
  ExamState,
  PowerUpType,
} from "@/lib/exermind/types";
import {
  callExamRpc,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";

import { EXERMIND_CONFIG } from "@/config/exermind.config";

type StartSessionResult = ActionResult<ExamState> & {
  isExisting?: boolean;
  session?: ExamSessionState;
  questions?: ExamState["questions"];
};

export async function startSession({
  powerUps,
}: {
  powerUps: readonly PowerUpType[] | readonly string[];
}): Promise<StartSessionResult> {
  let selection: PowerUpType[];

  try {
    selection = validatePowerUpSelection(powerUps);
  } catch (error) {
    return rpcFailure(error, "Select exactly three valid power-ups.");
  }

  try {
    const { data, error } = await callExamRpc<ExamState>("start_session", {
      p_power_ups: selection,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to start the exam session.");
    }

    const state = sanitizeExamState(data);
    return {
      success: true,
      data: state,
      session: state.session,
      questions: state.questions,
    };
  } catch (error) {
    return rpcFailure(error, "Failed to start the exam session.");
  }
}
