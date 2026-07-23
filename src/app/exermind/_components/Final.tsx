"use client";

import React, { useState, useEffect } from "react";
import PowerupModal from "./PowerupModal";
import type { PowerUpOption } from "./powerup";
import InputEsai from "./InputEsai";
import { EXERMIND_CONFIG } from "@/config/exermind.config";

import { useRouter } from "next/navigation";
import { submitExam } from "@/actions/exermind/submitExam";
import { saveDraftAnswers, getDraftAnswers } from "@/actions/exermind/draftAnswers";
import { getWarningCount, incrementWarningCount } from "@/actions/exermind/warningCount";

interface FinalProps {
  session?: any;
  questions?: any[];
  teamName?: string;
  userName?: string;
}

export default function Final({
  session,
  questions = [],
  teamName = "",
  userName = "",
}: FinalProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [warningCount, setWarningCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningReason, setWarningReason] = useState<string>("");

  const questionsRef = React.useRef(questions);
  const currentQuestionIndexRef = React.useRef(currentQuestionIndex);

  useEffect(() => {
    questionsRef.current = questions;
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [questions, currentQuestionIndex]);

  const sendTelemetry = async (eventType: string, extraMeta?: Record<string, any>) => {
    if (!EXERMIND_CONFIG.ANTICHEAT_ACTIVE || !session?.id) return null;
    try {
      const res = await fetch("/api/v1/exam/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          event_type: eventType,
          timestamp: Date.now(),
          metadata: {
            question_id: questionsRef.current[currentQuestionIndexRef.current]?.id || "none",
            ...extraMeta,
          },
        }),
      });
      return await res.json();
    } catch (err) {
      console.error("Telemetry send error:", err);
      return null;
    }
  };

  // Anti-Cheat visibility & focus monitoring (Synced with Upstash Redis)
  useEffect(() => {
    if (!EXERMIND_CONFIG.ANTICHEAT_ACTIVE || !session?.id) return;

    // Fetch initial warning count from Upstash Redis on mount
    getWarningCount({ sessionId: session.id }).then((res) => {
      if (res.success && res.warningCount !== undefined) {
        setWarningCount(res.warningCount);
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        setWarningReason("Tab switching or browser minimization detected!");

        // Send telemetry (which increments warning count once in Upstash Redis)
        const data = await sendTelemetry("TAB_HIDDEN");
        const next = data?.warning_count ?? 1;
        setWarningCount(next);

        if (next >= EXERMIND_CONFIG.MAX_WARNING_COUNT) {
          executeSubmission();
        } else {
          setShowWarningModal(true);
        }
      }
    };

    const handleBlur = () => {
      sendTelemetry("WINDOW_BLUR");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [session?.id]);

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (session?.expires_at) {
      const expires = new Date(session.expires_at).getTime();
      const now = new Date().getTime();
      return Math.max(Math.floor((expires - now) / 1000), 0);
    }
    return 3600; // Default 60 minutes in seconds
  });
  const [incrementText, setIncrementText] = useState<string | null>(null);

  // Restore draft answers from Upstash Redis on mount
  useEffect(() => {
    const restoreDrafts = async () => {
      if (!session?.id) return;
      try {
        let restored: Record<string, string> = {};
        if (typeof window !== "undefined") {
          const localDraft = localStorage.getItem(`exermind_draft_${session.id}`);
          if (localDraft) {
            try {
              restored = JSON.parse(localDraft);
            } catch (e) {}
          }
        }

        const redisRes = await getDraftAnswers({ sessionId: session.id });
        if (redisRes.success && redisRes.answers) {
          restored = { ...restored, ...redisRes.answers };
        }

        if (Object.keys(restored).length > 0) {
          setSelectedAnswers(restored);
        }
      } catch (err) {
        console.error("Error restoring draft answers:", err);
      }
    };

    restoreDrafts();
  }, [session?.id]);

  // Retrieve powerups from localStorage if saved during start page
  const [selectedPowerups] = useState<PowerUpOption[]>(() => {
    if (typeof window !== "undefined" && session?.team_id) {
      try {
        const saved = localStorage.getItem(`exermind_powerups_${session.team_id}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved powerups:", e);
      }
    }
    return ["hint", "add-time", null];
  });

  const executeSubmission = async () => {
    if (!session?.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await submitExam({
        sessionId: session.id,
        answers: selectedAnswers,
      });

      if (res.success) {
        if (typeof window !== "undefined" && session.team_id) {
          localStorage.removeItem(`exermind_active_tab_${session.team_id}`);
          localStorage.removeItem(`exermind_powerups_${session.team_id}`);
          localStorage.removeItem(`exermind_draft_${session.id}`);
        }
        router.push("/exermind/finish");
      } else {
        alert(res.message || "Failed to submit exam.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setIsSubmitting(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting && session?.id) {
      executeSubmission();
    }
  }, [timeLeft, isSubmitting, session?.id]);

  // Handle time increment notification from PowerupModal
  const handleIncrement = (minutes: number) => {
    setIncrementText(`(+${minutes} min)`);
    setTimeout(() => setIncrementText(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (questionId: string, optionKey: string) => {
    const updated = {
      ...selectedAnswers,
      [questionId]: optionKey,
    };

    setSelectedAnswers(updated);

    if (typeof window !== "undefined" && session?.id) {
      localStorage.setItem(`exermind_draft_${session.id}`, JSON.stringify(updated));
    }

    if (session?.id) {
      saveDraftAnswers({ sessionId: session.id, answers: updated });
    }
  };

  const renderOptions = () => {
    if (!currentQuestion?.content?.options) return null;
    const rawOptions = currentQuestion.content.options;

    let optionsList: { key: string; text: string }[] = [];

    if (Array.isArray(rawOptions)) {
      optionsList = rawOptions.map((item: any, idx: number) => {
        if (typeof item === "string") {
          return { key: String.fromCharCode(65 + idx), text: item };
        }
        if (typeof item === "object" && item !== null) {
          return {
            key: item.id || item.key || String.fromCharCode(65 + idx),
            text: typeof item.text === "string" ? item.text : JSON.stringify(item),
          };
        }
        return { key: String(idx), text: String(item) };
      });
    } else if (typeof rawOptions === "object" && rawOptions !== null) {
      optionsList = Object.entries(rawOptions).map(([k, val]: [string, any]) => {
        if (typeof val === "string") {
          return { key: k, text: val };
        }
        if (typeof val === "object" && val !== null) {
          return { key: k, text: val.text || val.value || JSON.stringify(val) };
        }
        return { key: k, text: String(val) };
      });
    }

    return (
      <div className="mt-6 space-y-3">
        {optionsList.map(({ key, text }) => {
          const isSelected = selectedAnswers[currentQuestion.id] === key;
          return (
            <button
              key={key}
              onClick={() => handleOptionSelect(currentQuestion.id, key)}
              className={`flex w-full items-center justify-start rounded-lg border p-4 text-left font-montserrat text-sm transition-all ${
                isSelected
                  ? "border-[#88D6FA] bg-[#042440] text-white ring-1 ring-[#88D6FA]"
                  : "border-gray-800 bg-[#111417] text-gray-300 hover:border-gray-700 hover:bg-gray-800/50"
              }`}
            >
              <span
                className={`mr-3 flex h-7 w-7 items-center justify-center rounded-full font-orbitron text-xs font-bold ${
                  isSelected ? "bg-[#88D6FA] text-black" : "bg-gray-800 text-gray-400"
                }`}
              >
                {String(key).toUpperCase()}
              </span>
              <span>{text}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const isEssayQuestion =
    currentQuestion?.type === "ESSAY" ||
    EXERMIND_CONFIG.QUESTION_TYPE === "ESSAY";

  return (
    <div
      onCopy={(e) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          e.preventDefault();
          sendTelemetry("COPY_ATTEMPT");
        }
      }}
      onPaste={(e) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          e.preventDefault();
          sendTelemetry("PASTE_ATTEMPT");
        }
      }}
      onCut={(e) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          e.preventDefault();
          sendTelemetry("CUT_ATTEMPT");
        }
      }}
      onContextMenu={(e) => {
        if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
          e.preventDefault();
          sendTelemetry("CONTEXT_MENU_ATTEMPT");
        }
      }}
      className={`flex min-h-screen flex-col bg-[#111417] text-white ${
        EXERMIND_CONFIG.ANTICHEAT_ACTIVE ? "select-none" : ""
      }`}
    >
      {/* Header bar */}
      <header className="flex flex-wrap items-center justify-between border-b border-gray-800 bg-[#161a1f] px-6 py-4">
        <div className="flex items-center space-x-4">
          <img src="/home/header/logo_exertion.svg" alt="Exertion" className="h-8" />
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

        {/* Timer Badge */}
        <div className="flex items-center space-x-3 rounded-lg border border-gray-800 bg-[#111417] px-4 py-2">
          <span className="font-orbitron text-xs uppercase tracking-wider text-gray-300">
            Time Left:
          </span>
          <span className="font-orbitron text-lg font-bold text-[#88D6FA]">
            {formatTime(timeLeft)}
          </span>
          {incrementText && (
            <span className="font-orbitron text-sm text-green-400 animate-bounce">
              {incrementText}
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col p-6 md:p-10">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col space-y-6">
          {/* Question Navigator Pills */}
          <div className="flex flex-wrap gap-2 rounded-xl bg-[#161a1f] p-4 border border-gray-800">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-9 w-9 rounded-lg font-orbitron text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#88D6FA] text-black ring-2 ring-white"
                      : isAnswered
                        ? "bg-teal-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Display */}
          {currentQuestion ? (
            <div className="flex flex-1 flex-col justify-between rounded-xl border border-gray-800 bg-[#161a1f] p-6 shadow-xl md:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="font-orbitron text-sm font-semibold text-[#88D6FA]">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="rounded bg-gray-800 px-3 py-1 text-xs text-gray-300 font-mono uppercase">
                    Type: {currentQuestion.type || "Multiple Choice"}
                  </span>
                </div>

                <h3 className="font-montserrat text-lg font-medium leading-relaxed text-white md:text-xl">
                  {currentQuestion.prompt}
                </h3>

                {/* Question Input / Options Rendering */}
                {isEssayQuestion ? (
                  <InputEsai
                    value={selectedAnswers[currentQuestion.id] || ""}
                    onChange={(val) => handleOptionSelect(currentQuestion.id, val)}
                    onIllegalAction={(action) => sendTelemetry(action)}
                  />
                ) : (
                  renderOptions()
                )}
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-800 pt-6">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="rounded-lg bg-gray-800 px-6 py-2.5 font-orbitron text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(prev + 1, questions.length - 1),
                      )
                    }
                    className="rounded-lg bg-[#88D6FA] px-6 py-2.5 font-orbitron text-sm font-bold text-black transition hover:bg-sky-400"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    disabled={isSubmitting}
                    onClick={() => setShowConfirmModal(true)}
                    className="rounded-lg bg-green-500 px-8 py-2.5 font-orbitron text-sm font-bold text-black transition hover:bg-green-400 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Exam"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-gray-800 bg-[#161a1f] p-12 text-center text-gray-400 font-montserrat">
              No question loaded for this index.
            </div>
          )}
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-[#161a1f] p-6 text-center shadow-2xl">
            <h3 className="font-orbitron text-xl font-bold text-white">
              Confirm Exam Submission
            </h3>
            <p className="font-montserrat text-sm text-gray-300">
              Are you sure you want to submit your exam? You have answered{" "}
              <span className="font-bold text-[#88D6FA]">
                {Object.keys(selectedAnswers).length}
              </span>{" "}
              out of <span className="font-bold text-white">{questions.length}</span> questions.
            </p>

            <div className="flex space-x-4 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-full border border-gray-700 bg-gray-800 py-3 font-orbitron text-xs font-semibold text-gray-300 hover:bg-gray-700"
              >
                Continue Exam
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  executeSubmission();
                }}
                className="flex-1 rounded-full bg-green-500 py-3 font-orbitron text-xs font-bold text-black hover:bg-green-400 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-yellow-500 bg-[#161a1f] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="font-orbitron text-xl font-bold uppercase text-yellow-400">
                Anti-Cheat Violation Warning
              </h3>
              <p className="font-montserrat text-xs text-gray-200 leading-relaxed">
                {warningReason || "Browser focus loss or tab switching detected."}
              </p>
            </div>

            <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-3 font-orbitron text-sm font-bold text-yellow-300">
              Warning {warningCount} of {EXERMIND_CONFIG.MAX_WARNING_COUNT}
            </div>

            <p className="font-montserrat text-[11px] text-gray-400">
              Exceeding {EXERMIND_CONFIG.MAX_WARNING_COUNT} warnings will result in immediate automatic exam submission.
            </p>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full rounded-full bg-yellow-500 py-3 font-orbitron text-xs font-bold text-black hover:bg-yellow-400 active:scale-95 shadow-lg uppercase tracking-wide transition-all"
            >
              I Understand & Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* Floating PowerUp Modal */}
      <PowerupModal
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        onIncrement={handleIncrement}
        initialSelection={selectedPowerups.filter(
          (x): x is "hint" | "add-time" => x === "hint" || x === "add-time",
        )}
      />
    </div>
  );
}
