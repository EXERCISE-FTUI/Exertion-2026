"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  canReviewUsedHint,
  isDoublePointsAlreadyActive,
} from "@/lib/exermind/powerUps";
import { POWER_UP_META, type PowerUpType } from "./powerup";

export interface PowerUpView {
  id: string;
  type: PowerUpType;
  used: boolean;
  questionId?: string;
  hint?: string;
}

export interface PowerUpActivationFeedback {
  success: boolean;
  message?: string;
  hint?: string;
  multiplier?: number;
}

export interface PowerupModalProps {
  powerUps: PowerUpView[];
  activeMultiplier: number;
  isTimeFrozen: boolean;
  currentQuestionId?: string;
  disabled?: boolean;
  onActivate: (powerUpId: string) => Promise<PowerUpActivationFeedback>;
}

export default function PowerupModal({
  powerUps,
  activeMultiplier,
  isTimeFrozen,
  currentQuestionId,
  disabled = false,
  onActivate,
}: PowerupModalProps) {
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: PowerUpType;
    title: string;
    body: string;
  } | null>(null);

  const activate = async (powerUp: PowerUpView) => {
    const canReviewHint = canReviewUsedHint({
      type: powerUp.type,
      used: powerUp.used,
      hint: powerUp.hint,
      activatedQuestionId: powerUp.questionId,
      currentQuestionId,
    });
    const isDuplicateDoublePoints = isDoublePointsAlreadyActive({
      type: powerUp.type,
      used: powerUp.used,
      activeMultiplier,
    });

    if (canReviewHint && powerUp.hint) {
      setFeedback({
        type: "HINT",
        title: "Question hint",
        body: powerUp.hint,
      });
      return;
    }

    if (
      disabled ||
      powerUp.used ||
      activatingId ||
      (isTimeFrozen && powerUp.type === "TIME_FREEZE") ||
      isDuplicateDoublePoints
    ) {
      return;
    }

    setActivatingId(powerUp.id);
    try {
      const result = await onActivate(powerUp.id);
      if (!result.success) {
        setFeedback({
          type: powerUp.type,
          title: "Power-up unavailable",
          body: result.message || "This power-up could not be activated.",
        });
        return;
      }

      const label = POWER_UP_META[powerUp.type].label;
      const body =
        powerUp.type === "HINT"
          ? result.hint || result.message || "No hint was returned."
          : powerUp.type === "DOUBLE_POINTS"
            ? result.message ||
              `This question is now worth ${result.multiplier ?? activeMultiplier}x points.`
            : result.message || "The timer is frozen for this question.";

      setFeedback({
        type: powerUp.type,
        title: `${label} activated`,
        body,
      });
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <>
      <aside
        className="border-t border-gray-800 bg-[#161a1f] px-6 py-4"
        aria-label="Available power-ups"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="font-orbitron text-xs font-semibold tracking-wider text-gray-300 uppercase">
              Power-ups
            </p>
            {isTimeFrozen && (
              <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 font-orbitron text-[10px] font-bold text-cyan-200 uppercase">
                Timer frozen
              </span>
            )}
            {activeMultiplier > 1 && (
              <span className="rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 font-orbitron text-xs font-extrabold text-amber-200">
                {activeMultiplier}x
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {powerUps
              .filter((powerUp) => powerUp.type !== "DOUBLE_POINTS")
              .map((powerUp, index) => {
              const { label, Icon } = POWER_UP_META[powerUp.type];
              const isActivating = activatingId === powerUp.id;
              const isDuplicateFreeze =
                isTimeFrozen && powerUp.type === "TIME_FREEZE" && !powerUp.used;
              const canReviewHint = canReviewUsedHint({
                type: powerUp.type,
                used: powerUp.used,
                hint: powerUp.hint,
                activatedQuestionId: powerUp.questionId,
                currentQuestionId,
              });
              const isDuplicateDoublePoints = isDoublePointsAlreadyActive({
                type: powerUp.type,
                used: powerUp.used,
                activeMultiplier,
              });

              const isUsedOnThisQuestion =
                powerUp.used && powerUp.questionId === currentQuestionId;
              const isUsedOnOtherQuestion =
                powerUp.used && powerUp.questionId !== currentQuestionId;

              const isQuestionPowerUpLimitReached =
                !powerUp.used &&
                powerUps.some(
                  (p) => p.used && p.questionId === currentQuestionId,
                );

              return (
                <button
                  key={powerUp.id}
                  type="button"
                  onClick={() => activate(powerUp)}
                  disabled={
                    disabled ||
                    isDuplicateFreeze ||
                    isDuplicateDoublePoints ||
                    isQuestionPowerUpLimitReached ||
                    (powerUp.used && !canReviewHint) ||
                    Boolean(activatingId)
                  }
                  className={`group flex min-w-32 items-center gap-2.5 rounded-lg border px-3.5 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${
                    isUsedOnThisQuestion
                      ? "border-emerald-400/80 bg-emerald-950/60 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.3)] hover:bg-emerald-900/60"
                      : isUsedOnOtherQuestion
                        ? "border-slate-700/60 bg-slate-900/50 text-slate-500 opacity-40"
                        : "border-[#7287b7] bg-[#283553] text-white hover:border-[#88D6FA] hover:bg-[#314163]"
                  }`}
                  aria-label={`Power-up slot ${index + 1}: ${label}${
                    isUsedOnThisQuestion
                      ? ", active on this question"
                      : isUsedOnOtherQuestion
                        ? ", used on another question"
                        : isQuestionPowerUpLimitReached
                          ? ", only one power-up allowed per question"
                          : isDuplicateFreeze
                            ? ", unavailable while time is frozen"
                            : ""
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isUsedOnThisQuestion
                        ? "text-emerald-400"
                        : isUsedOnOtherQuestion
                          ? "text-slate-600"
                          : "text-[#88D6FA]"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <span className="font-orbitron text-[10px] font-semibold">
                      {isActivating ? "Activating..." : label}
                    </span>
                    {isUsedOnThisQuestion && (
                      <span className="text-[9px] font-bold text-emerald-300/90 uppercase tracking-wider">
                        Used Here
                      </span>
                    )}
                    {isUsedOnOtherQuestion && (
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                        Used
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {feedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="power-up-feedback-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#7287b7] bg-[#283553] p-6 text-white shadow-2xl">
            <div className="flex items-start gap-4">
              {(() => {
                const Icon = POWER_UP_META[feedback.type].Icon;
                return (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#88D6FA]/15 text-[#88D6FA]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1 space-y-2">
                <h2
                  id="power-up-feedback-title"
                  className="font-orbitron text-base font-bold"
                >
                  {feedback.title}
                </h2>
                <p className="font-montserrat text-sm leading-relaxed text-gray-200">
                  {feedback.body}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="rounded-md p-1 text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#88D6FA]"
                aria-label="Close power-up message"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
