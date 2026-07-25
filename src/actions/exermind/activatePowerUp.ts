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

const DOUBLE_POINTS_UNIQUE_INDEX =
  "session_powerups_one_active_double_points_per_question_idx";

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
      if (
        error?.code === "23505" &&
        error.message.includes(DOUBLE_POINTS_UNIQUE_INDEX)
      ) {
        return invalidInput(
          "EXERMIND_DOUBLE_POINTS_DUPLICATE",
          "Double Points is already active for this question.",
        );
      }

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
