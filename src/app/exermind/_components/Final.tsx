"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Snowflake } from "lucide-react";
import { useRouter } from "next/navigation";
import { activatePowerUp } from "@/actions/exermind/activatePowerUp";
import { completeQuestion } from "@/actions/exermind/completeQuestion";
import { getExamState } from "@/actions/exermind/getExamState";
import { saveAnswer } from "@/actions/exermind/saveAnswer";
import { submitExam } from "@/actions/exermind/submitExam";
import { getWarningCount } from "@/actions/exermind/warningCount";
import { EXERMIND_CONFIG } from "@/config/exermind.config";
import InputEsai from "./InputEsai";
import PowerupModal, { type PowerUpActivationFeedback } from "./PowerupModal";
import {
  actionSucceeded,
  getActionMessage,
  getHintFromActivation,
  getMultiplierFromActivation,
  normalizeExamState,
  type ExamQuestionView,
  type ExamStateView,
} from "./examState";

interface FinalProps {
  initialState: ExamStateView;
  teamName?: string;
  userName?: string;
}

const remainingSecondsFromState = (state: ExamStateView): number => {
  if (state.remainingSeconds !== null) {
    return Math.max(Math.floor(state.remainingSeconds), 0);
  }

  if (state.session?.expiresAt) {
    return Math.max(
      Math.ceil(
        (new Date(state.session.expiresAt).getTime() - Date.now()) / 1_000,
      ),
      0,
    );
  }

  return 0;
};

const normalizeOptions = (
  question: ExamQuestionView,
): { key: string; text: string }[] => {
  const rawOptions = question.content?.options;
  if (Array.isArray(rawOptions)) {
    return rawOptions.map((item, index) => {
      if (typeof item === "string") {
        return { key: String.fromCharCode(65 + index), text: item };
      }

      if (typeof item === "object" && item !== null) {
        const option = item as Record<string, unknown>;
        const key =
          typeof option.id === "string"
            ? option.id
            : typeof option.key === "string"
              ? option.key
              : String.fromCharCode(65 + index);
        const text =
          typeof option.text === "string"
            ? option.text
            : typeof option.value === "string"
              ? option.value
              : JSON.stringify(item);
        return { key, text };
      }

      return { key: String(index), text: String(item) };
    });
  }

  if (typeof rawOptions === "object" && rawOptions !== null) {
    return Object.entries(rawOptions).map(([key, value]) => {
      if (typeof value === "string") return { key, text: value };
      if (typeof value === "object" && value !== null) {
        const option = value as Record<string, unknown>;
        const text =
          typeof option.text === "string"
            ? option.text
            : typeof option.value === "string"
              ? option.value
              : JSON.stringify(value);
        return { key, text };
      }
      return { key, text: String(value) };
    });
  }

  return [];
};

export default function Final({
  initialState,
  teamName = "",
  userName = "",
}: FinalProps) {
  const router = useRouter();
  const initialQuestionIndex = Math.max(
    initialState.questions.findIndex(
      (question) => question.id === initialState.currentQuestionId,
    ),
    0,
  );

  const [examState, setExamState] = useState(initialState);
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialState.answers,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(initialQuestionIndex);
  const [timeLeft, setTimeLeft] = useState(() =>
    remainingSecondsFromState(initialState),
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [isActivatingPowerUp, setIsActivatingPowerUp] = useState(false);
  const [savingCount, setSavingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [warningCount, setWarningCount] = useState(
    initialState.session?.warningCount ?? 0,
  );
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [runnerMessage, setRunnerMessage] = useState<string | null>(null);

  const examStateRef = useRef(examState);
  const answersRef = useRef(answers);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const deadlineRef = useRef(
    Date.now() + remainingSecondsFromState(initialState) * 1_000,
  );
  const saveTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | undefined>
  >({});
  const saveQueuesRef = useRef<Record<string, Promise<boolean> | undefined>>(
    {},
  );
  const submittingRef = useRef(false);

  useEffect(() => {
    examStateRef.current = examState;
  }, [examState]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const applyAuthoritativeState = useCallback((response: unknown) => {
    const nextState = normalizeExamState(response);
    if (!nextState?.session) return null;

    examStateRef.current = nextState;
    answersRef.current = nextState.answers;
    setExamState(nextState);
    setAnswers(nextState.answers);
    return nextState;
  }, []);

  const refreshExamState = useCallback(async () => {
    const response = await getExamState();
    if (!actionSucceeded(response)) {
      setRunnerMessage(
        getActionMessage(response) || "Could not refresh the exam state.",
      );
      return null;
    }

    return applyAuthoritativeState(response);
  }, [applyAuthoritativeState]);

  useEffect(() => {
    const authoritativeRemaining = remainingSecondsFromState(examState);
    setTimeLeft(authoritativeRemaining);
    deadlineRef.current = Date.now() + authoritativeRemaining * 1_000;
  }, [
    examState.remainingSeconds,
    examState.session?.expiresAt,
    examState.isTimeFrozen,
  ]);

  useEffect(() => {
    if (examState.isTimeFrozen) return;

    const updateTimer = () => {
      setTimeLeft(
        Math.max(Math.ceil((deadlineRef.current - Date.now()) / 1_000), 0),
      );
    };
    updateTimer();
    const timer = setInterval(updateTimer, 250);
    return () => clearInterval(timer);
  }, [examState.isTimeFrozen, examState.session?.expiresAt]);

  const queueAnswerSave = useCallback(
    (questionId: string, answer: string): Promise<boolean> => {
      const previous =
        saveQueuesRef.current[questionId] ?? Promise.resolve(true);
      const next = previous.then(async () => {
        setSavingCount((count) => count + 1);
        try {
          const response = await saveAnswer({ questionId, answer });
          if (!actionSucceeded(response)) {
            setRunnerMessage(
              getActionMessage(response) || "The answer could not be saved.",
            );
            return false;
          }
          return true;
        } catch (error) {
          console.error("Answer save failed:", error);
          setRunnerMessage("The answer could not be saved. Try again.");
          return false;
        } finally {
          setSavingCount((count) => Math.max(count - 1, 0));
        }
      });

      saveQueuesRef.current[questionId] = next;
      return next;
    },
    [],
  );

  const updateAnswer = useCallback(
    (questionId: string, answer: string, debounce = false) => {
      const updated = { ...answersRef.current, [questionId]: answer };
      answersRef.current = updated;
      setAnswers(updated);
      setRunnerMessage(null);

      const existingTimer = saveTimersRef.current[questionId];
      if (existingTimer) clearTimeout(existingTimer);

      if (debounce) {
        saveTimersRef.current[questionId] = setTimeout(() => {
          saveTimersRef.current[questionId] = undefined;
          void queueAnswerSave(
            questionId,
            answersRef.current[questionId] ?? "",
          );
        }, 500);
      } else {
        void queueAnswerSave(questionId, answer);
      }
    },
    [queueAnswerSave],
  );

  const flushPendingAnswers = useCallback(async (): Promise<boolean> => {
    for (const [questionId, timer] of Object.entries(saveTimersRef.current)) {
      if (!timer) continue;
      clearTimeout(timer);
      saveTimersRef.current[questionId] = undefined;
      void queueAnswerSave(questionId, answersRef.current[questionId] ?? "");
    }

    const pendingSaves = Object.values(saveQueuesRef.current).filter(
      (save): save is Promise<boolean> => Boolean(save),
    );
    if (pendingSaves.length === 0) return true;

    const results = await Promise.all(pendingSaves);
    return results.every(Boolean);
  }, [queueAnswerSave]);

  useEffect(
    () => () => {
      Object.values(saveTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    },
    [],
  );

  const finalizeQuestion = useCallback(
    async (questionId: string): Promise<ExamStateView | null> => {
      if (examStateRef.current.completedQuestionIds.includes(questionId)) {
        return examStateRef.current;
      }

      const answer = answersRef.current[questionId] ?? "";
      if (!answer.trim()) {
        setRunnerMessage("Answer this question before moving to another one.");
        return null;
      }

      const pendingTimer = saveTimersRef.current[questionId];
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        saveTimersRef.current[questionId] = undefined;
      }

      const saved = await queueAnswerSave(questionId, answer);
      if (!saved) {
        await refreshExamState();
        return null;
      }

      const response = await completeQuestion({ questionId });
      if (!actionSucceeded(response)) {
        setRunnerMessage(
          getActionMessage(response) || "The question could not be completed.",
        );
        await refreshExamState();
        return null;
      }

      return applyAuthoritativeState(response);
    },
    [applyAuthoritativeState, queueAnswerSave, refreshExamState],
  );

  const navigateToQuestion = useCallback(
    async (targetIndex: number) => {
      const questions = examStateRef.current.questions;
      const boundedTarget = Math.min(
        Math.max(targetIndex, 0),
        questions.length - 1,
      );
      if (
        isNavigating ||
        isActivatingPowerUp ||
        isSubmitting ||
        boundedTarget === currentQuestionIndexRef.current
      ) {
        return;
      }

      const currentQuestion = questions[currentQuestionIndexRef.current];
      if (!currentQuestion) return;
      const targetQuestion = questions[boundedTarget];
      if (!targetQuestion) return;
      const requestedCompleted =
        examStateRef.current.completedQuestionIds.includes(targetQuestion.id);

      setIsNavigating(true);
      setRunnerMessage(null);
      try {
        let nextState = examStateRef.current;
        const currentCompleted = nextState.completedQuestionIds.includes(
          currentQuestion.id,
        );

        if (!currentCompleted) {
          if (currentQuestion.id !== nextState.currentQuestionId) {
            const authoritativeIndex = questions.findIndex(
              (question) => question.id === nextState.currentQuestionId,
            );
            if (authoritativeIndex >= 0) {
              setCurrentQuestionIndex(authoritativeIndex);
            }
            setRunnerMessage(
              "Continue from the current server question before moving ahead.",
            );
            return;
          }

          const completedState = await finalizeQuestion(currentQuestion.id);
          if (!completedState) return;
          nextState = completedState;
        }

        const destinationId = requestedCompleted
          ? targetQuestion.id
          : nextState.currentQuestionId;
        const destinationIndex = nextState.questions.findIndex(
          (question) => question.id === destinationId,
        );

        if (destinationIndex >= 0) {
          setCurrentQuestionIndex(destinationIndex);
        } else if (requestedCompleted) {
          setCurrentQuestionIndex(boundedTarget);
        }
      } finally {
        setIsNavigating(false);
      }
    },
    [finalizeQuestion, isActivatingPowerUp, isNavigating, isSubmitting],
  );

  const activateSelectedPowerUp = useCallback(
    async (powerUpId: string): Promise<PowerUpActivationFeedback> => {
      const state = examStateRef.current;
      const currentQuestion = state.questions[currentQuestionIndexRef.current];
      if (!currentQuestion) {
        return { success: false, message: "No active question was found." };
      }

      if (state.completedQuestionIds.includes(currentQuestion.id)) {
        return {
          success: false,
          message: "Power-ups cannot be used on a completed question.",
        };
      }

      if (state.currentQuestionId !== currentQuestion.id) {
        return {
          success: false,
          message:
            "Resume the current server question before using a power-up.",
        };
      }

      setIsActivatingPowerUp(true);
      try {
        const answersFlushed = await flushPendingAnswers();
        if (!answersFlushed) {
          await refreshExamState();
          return {
            success: false,
            message: "Save the current answer before using a power-up.",
          };
        }

        const response = await activatePowerUp({
          powerUpId,
          questionId: currentQuestion.id,
        });
        if (!actionSucceeded(response)) {
          return {
            success: false,
            message:
              getActionMessage(response) ||
              "The power-up could not be activated.",
          };
        }

        const nextState = applyAuthoritativeState(response);
        return {
          success: true,
          message: getActionMessage(response),
          hint: getHintFromActivation(response),
          multiplier:
            getMultiplierFromActivation(response) ??
            nextState?.score.multiplier,
        };
      } catch (error) {
        console.error("Power-up activation failed:", error);
        return {
          success: false,
          message: "The power-up could not be activated. Try again.",
        };
      } finally {
        setIsActivatingPowerUp(false);
      }
    },
    [applyAuthoritativeState, flushPendingAnswers, refreshExamState],
  );

  const executeSubmission = useCallback(
    async (mode: "manual" | "forced") => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setIsSubmitting(true);
      setRunnerMessage(null);

      try {
        const answersFlushed = await flushPendingAnswers();
        if (!answersFlushed && mode === "manual") {
          await refreshExamState();
          setRunnerMessage(
            "One or more answers were not saved. Review them before submitting.",
          );
          return;
        }

        const state = examStateRef.current;
        const currentQuestion =
          state.questions[currentQuestionIndexRef.current];
        const currentAnswer = currentQuestion
          ? answersRef.current[currentQuestion.id]
          : undefined;

        if (
          mode === "manual" &&
          currentQuestion &&
          currentAnswer?.trim() &&
          !state.completedQuestionIds.includes(currentQuestion.id)
        ) {
          const completedState = await finalizeQuestion(currentQuestion.id);
          if (!completedState) return;
        }

        const response = await submitExam();
        if (!actionSucceeded(response)) {
          setRunnerMessage(
            getActionMessage(response) || "The exam could not be submitted.",
          );
          await refreshExamState();
          return;
        }

        const teamId = examStateRef.current.session?.teamId;
        if (teamId) localStorage.removeItem(`exermind_active_tab_${teamId}`);
        router.replace("/exermind/finish");
      } catch (error) {
        console.error("Exam submission failed:", error);
        setRunnerMessage("The exam could not be submitted. Try again.");
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [finalizeQuestion, flushPendingAnswers, refreshExamState, router],
  );

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !examState.isTimeFrozen &&
      examState.session?.status === "IN_PROGRESS"
    ) {
      void executeSubmission("forced");
    }
  }, [
    examState.isTimeFrozen,
    examState.session?.status,
    executeSubmission,
    timeLeft,
  ]);

  const sendTelemetry = useCallback(
    async (eventType: string, extraMeta?: Record<string, unknown>) => {
      if (
        !EXERMIND_CONFIG.ANTICHEAT_ACTIVE ||
        !examStateRef.current.session?.id
      ) {
        return null;
      }

      try {
        const currentQuestion =
          examStateRef.current.questions[currentQuestionIndexRef.current];
        const response = await fetch("/api/v1/exam/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: examStateRef.current.session.id,
            event_type: eventType,
            timestamp: Date.now(),
            metadata: {
              question_id: currentQuestion?.id || "none",
              ...extraMeta,
            },
          }),
        });
        return (await response.json()) as { warning_count?: number };
      } catch (error) {
        console.error("Telemetry send error:", error);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    const sessionId = examState.session?.id;
    if (!EXERMIND_CONFIG.ANTICHEAT_ACTIVE || !sessionId) return;

    void getWarningCount({ sessionId }).then((response) => {
      if (response.success && response.warningCount !== undefined) {
        setWarningCount(response.warningCount);
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "hidden") return;

      setWarningReason("Tab switching or browser minimization detected.");
      const response = await sendTelemetry("TAB_HIDDEN");
      const nextWarningCount = response?.warning_count ?? warningCount + 1;
      setWarningCount(nextWarningCount);

      if (nextWarningCount >= EXERMIND_CONFIG.MAX_WARNING_COUNT) {
        void executeSubmission("forced");
      } else {
        setShowWarningModal(true);
      }
    };

    const handleBlur = () => {
      void sendTelemetry("WINDOW_BLUR");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examState.session?.id, executeSubmission, sendTelemetry, warningCount]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQuestion = examState.questions[currentQuestionIndex];
  const isCurrentCompleted = currentQuestion
    ? examState.completedQuestionIds.includes(currentQuestion.id)
    : false;
  const currentMultiplier = currentQuestion
    ? (examState.questionMultipliers[currentQuestion.id] ??
      (examState.currentQuestionId === currentQuestion.id
        ? examState.score.multiplier
        : 1))
    : 1;
  const currentOptions = useMemo(
    () => (currentQuestion ? normalizeOptions(currentQuestion) : []),
    [currentQuestion],
  );
  const isEssayQuestion =
    currentQuestion?.type === "ESSAY" ||
    EXERMIND_CONFIG.QUESTION_TYPE === "ESSAY";
  const answeredCount = Object.values(answers).filter((answer) =>
    answer.trim(),
  ).length;

  return (
    <div
      onCopy={(event) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          event.preventDefault();
          void sendTelemetry("COPY_ATTEMPT");
        }
      }}
      onPaste={(event) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          event.preventDefault();
          void sendTelemetry("PASTE_ATTEMPT");
        }
      }}
      onCut={(event) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          event.preventDefault();
          void sendTelemetry("CUT_ATTEMPT");
        }
      }}
      onContextMenu={(event) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          event.preventDefault();
          void sendTelemetry("CONTEXT_MENU_ATTEMPT");
        }
      }}
      className={`flex min-h-screen flex-col bg-[#111417] text-white ${
        EXERMIND_CONFIG.ANTICHEAT_ACTIVE ? "select-none" : ""
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 bg-[#161a1f] px-6 py-4">
        <div className="flex items-center space-x-4">
          <img
            src="/home/header/logo_exertion.svg"
            alt="Exertion"
            className="h-8"
          />
          <div>
            <h1 className="font-orbitron text-sm font-bold text-[#88D6FA] md:text-base">
              EXERMIND EXAM RUNNER
            </h1>
            <p className="font-montserrat text-xs text-gray-400">
              Team: <span className="text-white">{teamName}</span> | User:{" "}
              <span className="text-white">{userName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-800 bg-[#111417] px-3 py-2 text-center">
            <span className="block font-orbitron text-[9px] tracking-wider text-gray-400 uppercase">
              Game score
            </span>
            <span className="font-orbitron text-sm font-bold text-amber-300">
              {examState.score.gameScore}
            </span>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-gray-800 bg-[#111417] px-4 py-2">
            {examState.isTimeFrozen && (
              <Snowflake
                className="h-4 w-4 text-cyan-200"
                aria-label="Timer frozen"
              />
            )}
            <span className="font-orbitron text-xs tracking-wider text-gray-300 uppercase">
              {examState.isTimeFrozen ? "Frozen" : "Time left"}
            </span>
            <span className="font-orbitron text-lg font-bold text-[#88D6FA]">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6 md:p-10">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col space-y-6">
          {runnerMessage && (
            <div
              className="font-montserrat rounded-lg border border-amber-400/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
              role="alert"
            >
              {runnerMessage}
            </div>
          )}

          <nav
            className="flex flex-wrap gap-2 rounded-xl border border-gray-800 bg-[#161a1f] p-4"
            aria-label="Exam questions"
          >
            {examState.questions.map((question, index) => {
              const isAnswered = Boolean(answers[question.id]?.trim());
              const isCompleted = examState.completedQuestionIds.includes(
                question.id,
              );
              const isCurrent = index === currentQuestionIndex;
              const canVisit =
                isCompleted || question.id === examState.currentQuestionId;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => void navigateToQuestion(index)}
                  disabled={
                    isNavigating ||
                    isActivatingPowerUp ||
                    isSubmitting ||
                    !canVisit
                  }
                  className={`h-9 w-9 rounded-lg font-orbitron text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    isCurrent
                      ? "bg-[#88D6FA] text-black ring-2 ring-white"
                      : isCompleted
                        ? "bg-teal-600 text-white"
                        : isAnswered
                          ? "bg-[#314163] text-[#88D6FA]"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {index + 1}
                </button>
              );
            })}
          </nav>

          {currentQuestion ? (
            <section className="flex flex-1 flex-col justify-between rounded-xl border border-gray-800 bg-[#161a1f] p-6 shadow-xl md:p-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                  <span className="font-orbitron text-sm font-semibold text-[#88D6FA]">
                    Question {currentQuestionIndex + 1} of{" "}
                    {examState.questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentMultiplier > 1 && (
                      <span className="rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 font-orbitron text-xs font-extrabold text-amber-200">
                        {currentMultiplier}x points
                      </span>
                    )}
                    {isCurrentCompleted && (
                      <span className="rounded-full bg-teal-500/15 px-3 py-1 font-orbitron text-[10px] font-bold text-teal-300 uppercase">
                        Completed
                      </span>
                    )}
                    <span className="rounded bg-gray-800 px-3 py-1 font-mono text-xs text-gray-300 uppercase">
                      {currentQuestion.type || "Multiple Choice"}
                    </span>
                  </div>
                </div>

                <h2 className="font-montserrat text-lg leading-relaxed font-medium text-white md:text-xl">
                  {currentQuestion.prompt}
                </h2>

                {isEssayQuestion ? (
                  <InputEsai
                    value={answers[currentQuestion.id] || ""}
                    onChange={(value) =>
                      updateAnswer(currentQuestion.id, value, true)
                    }
                    disabled={
                      isCurrentCompleted ||
                      isNavigating ||
                      isActivatingPowerUp ||
                      isSubmitting
                    }
                    onIllegalAction={(action) => void sendTelemetry(action)}
                  />
                ) : (
                  <div className="mt-6 space-y-3">
                    {currentOptions.map(({ key, text }) => {
                      const isSelected = answers[currentQuestion.id] === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateAnswer(currentQuestion.id, key)}
                          disabled={
                            isCurrentCompleted ||
                            isNavigating ||
                            isActivatingPowerUp ||
                            isSubmitting
                          }
                          className={`font-montserrat flex w-full items-center justify-start rounded-lg border p-4 text-left text-sm transition-all disabled:cursor-not-allowed ${
                            isSelected
                              ? "border-[#88D6FA] bg-[#042440] text-white ring-1 ring-[#88D6FA]"
                              : "border-gray-800 bg-[#111417] text-gray-300 hover:border-gray-700 hover:bg-gray-800/50 disabled:hover:border-gray-800 disabled:hover:bg-[#111417]"
                          }`}
                        >
                          <span
                            className={`mr-3 flex h-7 w-7 items-center justify-center rounded-full font-orbitron text-xs font-bold ${
                              isSelected
                                ? "bg-[#88D6FA] text-black"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {String(key).toUpperCase()}
                          </span>
                          <span>{text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    void navigateToQuestion(currentQuestionIndex - 1)
                  }
                  disabled={
                    currentQuestionIndex === 0 ||
                    isNavigating ||
                    isActivatingPowerUp ||
                    isSubmitting
                  }
                  className="rounded-lg bg-gray-800 px-6 py-2.5 font-orbitron text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="font-montserrat text-xs text-gray-400">
                  {savingCount > 0
                    ? "Saving answer..."
                    : isNavigating
                      ? "Completing question..."
                      : "Answers save to the server automatically"}
                </span>

                {currentQuestionIndex < examState.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      void navigateToQuestion(currentQuestionIndex + 1)
                    }
                    disabled={
                      isNavigating || isActivatingPowerUp || isSubmitting
                    }
                    className="rounded-lg bg-[#88D6FA] px-6 py-2.5 font-orbitron text-sm font-bold text-black transition hover:bg-sky-400 disabled:opacity-50"
                  >
                    {isNavigating ? "Completing..." : "Next Question"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={
                      isSubmitting || isNavigating || isActivatingPowerUp
                    }
                    onClick={() => setShowConfirmModal(true)}
                    className="rounded-lg bg-green-500 px-8 py-2.5 font-orbitron text-sm font-bold text-black transition hover:bg-green-400 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Exam"}
                  </button>
                )}
              </div>
            </section>
          ) : (
            <div className="font-montserrat flex flex-1 items-center justify-center rounded-xl border border-gray-800 bg-[#161a1f] p-12 text-center text-gray-400">
              No question is available at this position.
            </div>
          )}
        </div>
      </main>

      <PowerupModal
        powerUps={examState.powerUps}
        activeMultiplier={currentMultiplier}
        isTimeFrozen={examState.isTimeFrozen}
        currentQuestionId={currentQuestion?.id}
        disabled={
          isCurrentCompleted ||
          isNavigating ||
          isActivatingPowerUp ||
          isSubmitting ||
          !currentQuestion
        }
        onActivate={activateSelectedPowerUp}
      />

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-[#161a1f] p-6 text-center shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-exam-title"
          >
            <h2
              id="submit-exam-title"
              className="font-orbitron text-xl font-bold text-white"
            >
              Confirm Exam Submission
            </h2>
            <p className="font-montserrat text-sm text-gray-300">
              You have answered{" "}
              <span className="font-bold text-[#88D6FA]">{answeredCount}</span>{" "}
              of{" "}
              <span className="font-bold text-white">
                {examState.questions.length}
              </span>{" "}
              questions. Submission cannot be undone.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-full border border-gray-700 bg-gray-800 py-3 font-orbitron text-xs font-semibold text-gray-300 hover:bg-gray-700"
              >
                Continue Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  void executeSubmission("manual");
                }}
                className="flex-1 rounded-full bg-green-500 py-3 font-orbitron text-xs font-bold text-black hover:bg-green-400 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div
            className="w-full max-w-md space-y-5 rounded-2xl border border-yellow-500 bg-[#161a1f] p-6 text-center shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="anti-cheat-warning-title"
          >
            <h2
              id="anti-cheat-warning-title"
              className="font-orbitron text-xl font-bold text-yellow-400 uppercase"
            >
              Anti-Cheat Warning
            </h2>
            <p className="font-montserrat text-xs leading-relaxed text-gray-200">
              {warningReason}
            </p>
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-3 font-orbitron text-sm font-bold text-yellow-300">
              Warning {warningCount} of {EXERMIND_CONFIG.MAX_WARNING_COUNT}
            </div>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full rounded-full bg-yellow-500 py-3 font-orbitron text-xs font-bold tracking-wide text-black uppercase hover:bg-yellow-400"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
