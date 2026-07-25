"use server";

import type { ActionResult, ExamState } from "@/lib/exermind/types";
import {
  callExamRpc,
  invalidInput,
  rpcFailure,
  sanitizeExamState,
} from "@/lib/exermind/server";

type ActivatePowerUpResult = ActionResult<ExamState> & {
  hint?: string;
};

export async function activatePowerUp({
  powerUpId,
  questionId,
}: {
  powerUpId: string;
  questionId: string;
}): Promise<ActivatePowerUpResult> {
  if (!powerUpId || !questionId) {
    return invalidInput(
      "EXERMIND_INVALID_INPUT",
      "A power-up and question are required.",
    );
  }

  try {
    const { data, error } = await callExamRpc<ExamState>("activate_power_up", {
      p_power_up_id: powerUpId,
      p_question_id: questionId,
    });

    if (error || !data) {
      return rpcFailure(error, "Failed to activate the power-up.");
    }

    const state = sanitizeExamState(data);
    const activatedPowerUp = state.powerUps.find(
      (powerUp) => powerUp.id === powerUpId,
    );

    return {
      success: true,
      data: state,
      ...(activatedPowerUp?.hint ? { hint: activatedPowerUp.hint } : {}),
    };
  } catch (error) {
    return rpcFailure(error, "Failed to activate the power-up.");
  }
}
