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

        if (!EXERMIND_CONFIG.LOCKED_SEQUENCE) {
          await flushPendingAnswers();
          setCurrentQuestionIndex(boundedTarget);
          return;
        }

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
    [finalizeQuestion, flushPendingAnswers, isActivatingPowerUp, isNavigating, isSubmitting],
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
          EXERMIND_CONFIG.LOCKED_SEQUENCE &&
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
    currentQuestion?.type?.toUpperCase() === "ESSAY";
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
      // BG Biru utama, ganti url('/bg-cyber.png') dengan path gambar grid hex/cyber aslimu
      className={`relative flex min-h-screen flex-col bg-gradient-to-b from-[#528CC0] via-[#528FC5] to-[#7CBCE8] text-white ${
        EXERMIND_CONFIG.ANTICHEAT_ACTIVE ? "select-none" : ""
      }`}
    >
      {/* 1. KIRI ATAS: Logo Exertion Ala Cyber */}
      <div className="fixed left-0 top-0 z-50">
          <img
            src="/logo-exermind.svg"
            alt="Exertion"
            className="h-20 w-auto md:h-16 lg:h-20"
          />
      </div>

      {/* MAIN CONTENT: Layout Split Kiri-Kanan */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-6 pt-24 md:p-10">
        <div className="flex w-full max-w-6xl flex-col items-start gap-10 md:flex-row">
          
          {/* 2. KOLOM KIRI: Kotak Navigasi Angka & Timer */}
          <aside className="w-full shrink-0 md:w-[280px]">
            <h3 className="mb-2 text-center font-orbitron text-sm font-bold uppercase tracking-[0.2em] text-white">
              {teamName || userName || "DOWN123"}
            </h3>
            <div className="rounded-xl bg-[#041a2f] p-5 shadow-2xl">
              <nav className="mb-6 grid grid-cols-4 gap-2" aria-label="Exam questions">
                {examState.questions.map((question, index) => {
                  const isAnswered = Boolean(answers[question.id]?.trim());
                  const isCompleted = examState.completedQuestionIds.includes(question.id);
                  const isCurrent = index === currentQuestionIndex;
                  const canVisit =
                    !EXERMIND_CONFIG.LOCKED_SEQUENCE ||
                    isCompleted ||
                    question.id === examState.currentQuestionId;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => void navigateToQuestion(index)}
                      disabled={isNavigating || isActivatingPowerUp || isSubmitting || !canVisit}
                      className={`h-9 w-full rounded font-orbitron text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        isCurrent
                          ? "bg-[#4deeea] text-black shadow-[0_0_10px_#4deeea]"
                          : isAnswered || isCompleted
                            ? "bg-[#00D68F] text-black font-extrabold shadow-[0_0_8px_rgba(0,214,143,0.5)]"
                            : "bg-[#0a2742] text-gray-300 border border-white/20 hover:bg-[#1C465C]"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </nav>
              <div className="flex items-center gap-2 font-orbitron text-[11px] uppercase tracking-widest text-white">
                Time Left : <span className="text-sm font-bold">{formatTime(timeLeft)}</span>
                {examState.isTimeFrozen && (
                  <Snowflake className="h-4 w-4 text-cyan-200" aria-label="Timer frozen" />
                )}
              </div>
            </div>
          </aside>

          {/* 3. KOLOM KANAN: Kotak Pertanyaan & Jawaban */}
          <section className="relative flex w-full flex-1 flex-col mt-4 md:mt-0">
            {/* Maskot Kanan Atas (Ganti src dengan path maskotmu) */}
            <div className="absolute -top-20 right-0 z-20 hidden h-48 w-48 md:block lg:-top-28 lg:h-56 lg:w-56">
              <img
                src="/mascot-exermind.svg" 
                alt="Exertion Mascot"
                className="h-50 w-50 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              />
            </div>

            {currentQuestion ? (
              <div className="relative z-10 space-y-4">
                {/* Alert jika ada error server (Dipertahankan dari JS asli) */}
                {runnerMessage && (
                  <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/20 px-4 py-3 text-sm text-amber-100">
                    {runnerMessage}
                  </div>
                )}

                {/* Kotak Teks Pertanyaan */}
                <div className="rounded-xl bg-[#041a2f] p-6 shadow-[0_0_25px_5px_rgba(255,255,255,1)] border border-white/10 md:p-8">
                  <div className="font-montserrat text-lg font-semibold leading-relaxed text-white md:text-xl">
                    <span className="font-bold text-[#4deeea] mr-2">{currentQuestionIndex + 1}.</span>
                    {currentQuestion.prompt
                      .replace(/([^\n])\s*\*\s+/g, "$1\n* ")
                      .split("\n")
                      .map((line, idx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                          return (
                            <div key={idx} className="my-1.5 flex items-start gap-2.5 pl-6 text-[#4deeea]">
                              <span className="text-[#4deeea] font-bold text-xl leading-none">•</span>
                              <span className="text-white font-medium">{trimmed.substring(2)}</span>
                            </div>
                          );
                        }
                        return (
                          <span key={idx} className="block min-h-[1.2rem] my-1">
                            {line}
                          </span>
                        );
                      })}
                  </div>
                  {(currentQuestion.content?.image_url || currentQuestion.content?.image) && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={String(currentQuestion.content.image_url || currentQuestion.content.image)}
                        alt={`Question ${currentQuestionIndex + 1} Diagram`}
                        className="max-h-80 w-auto rounded-lg border border-cyan-500/40 object-contain shadow-md"
                      />
                    </div>
                  )}
                </div>

                {/* Kotak Pilihan Jawaban */}
                {isEssayQuestion ? (
                  <InputEsai
                    value={answers[currentQuestion.id] || ""}
                    onChange={(value) => updateAnswer(currentQuestion.id, value, true)}
                    disabled={(EXERMIND_CONFIG.LOCKED_SEQUENCE && isCurrentCompleted) || isNavigating || isActivatingPowerUp || isSubmitting}
                    onIllegalAction={(action) => void sendTelemetry(action)}
                  />
                ) : (
                  <div className="mt-4 space-y-3">
                    {currentOptions.map(({ key, text }) => {
                      const isSelected = answers[currentQuestion.id] === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateAnswer(currentQuestion.id, key)}
                          disabled={(EXERMIND_CONFIG.LOCKED_SEQUENCE && isCurrentCompleted) || isNavigating || isActivatingPowerUp || isSubmitting}
                          className={`w-full rounded-xl p-5 shadow-[0_0_25px_5px_rgba(255,255,255,1)] border border-white/10 text-left font-montserrat text-sm font-bold shadow-md transition-all disabled:cursor-not-allowed ${
                            isSelected
                              ? "bg-[#44D5EA] text-[#041a2f] scale-[1.01] shadow-[0_0_10px_#ffffff,0_0_30px_#44D5EA]"
                              : "bg-[#0a2742] text-white shadow-[0_0_15px_rgba(77,238,234,0.15)] border border-cyan-500/20 hover:bg-[#1C465C] hover:shadow-[0_0_25px_rgba(77,238,234,0.4)] hover:border-cyan-500/40"  
                          }`}
                        >
                          {text}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tombol Next / Submit di Kanan Bawah */}
                <div className="mt-8 flex justify-end">
                  {currentQuestionIndex < examState.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => void navigateToQuestion(currentQuestionIndex + 1)}
                      disabled={isNavigating || isActivatingPowerUp || isSubmitting}
                      className="rounded-xl bg-[#041a2f] px-12 py-3 font-orbitron text-sm font-bold text-white shadow-lg transition-all hover:bg-[#0a2742] disabled:opacity-50"
                    >
                      {isNavigating ? "Completing..." : "Next"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting || isNavigating || isActivatingPowerUp}
                      onClick={() => setShowConfirmModal(true)}
                      className="rounded-xl bg-[#4deeea] px-12 py-3 font-orbitron text-sm font-bold text-[#041a2f] shadow-lg transition hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl bg-[#041a2f] p-12 text-center text-gray-400 shadow-xl">
                No question is available at this position.
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Floating PowerUp Modal */}
      {EXERMIND_CONFIG.SKILLS_ACTIVE && (
        <PowerupModal
          powerUps={examState.powerUps}
          activeMultiplier={currentMultiplier}
          isTimeFrozen={examState.isTimeFrozen}
          currentQuestionId={currentQuestion?.id}
          disabled={
            isCurrentCompleted || isNavigating || isActivatingPowerUp || isSubmitting || !currentQuestion
          }
          onActivate={activateSelectedPowerUp}
        />
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-[#041a2f] p-6 text-center shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="font-orbitron text-xl font-bold text-white">
              Confirm Exam Submission
            </h2>
            <p className="font-montserrat text-sm text-gray-300">
              You have answered <span className="font-bold text-[#4deeea]">{answeredCount}</span> of{" "}
              <span className="font-bold text-white">{examState.questions.length}</span> questions. Submission cannot be undone.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-full border border-gray-600 bg-[#0a2742] py-3 font-orbitron text-xs font-semibold text-gray-300 hover:bg-[#14304a]"
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
                className="flex-1 rounded-full bg-[#4deeea] py-3 font-orbitron text-xs font-bold text-[#041a2f] hover:bg-cyan-300 disabled:opacity-50"
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
            className="w-full max-w-md space-y-5 rounded-2xl border border-yellow-500 bg-[#041a2f] p-6 text-center shadow-2xl"
            role="alertdialog"
            aria-modal="true"
          >
            <h2 className="font-orbitron text-xl font-bold uppercase text-yellow-400">
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
              className="w-full rounded-full bg-yellow-500 py-3 font-orbitron text-xs font-bold uppercase tracking-wide text-black hover:bg-yellow-400"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}