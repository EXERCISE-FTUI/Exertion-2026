"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ChoosePower from "../_components/ChoosePower";
import type { PowerUpType } from "../_components/powerup";
import { startSession } from "@/actions/exermind/startSession";
import { getExamState } from "@/actions/exermind/getExamState";
import { normalizeExamState } from "../_components/examState";
import Image from "next/image";
import { EXERMIND_CONFIG } from "@/config/exermind.config";

/* ─── Token Error Modal ─── */
function TokenErrorModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-lg animate-[fadeInScale_0.25s_ease-out] rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="4" x2="14" y2="14" />
            <line x1="14" y1="4" x2="4" y2="14" />
          </svg>
        </button>

        <h3 className="font-orbitron text-xl font-bold text-[#0A2540]">
          Token Yang Anda Masukkan Salah
        </h3>
        <div className="mt-3 h-px w-full bg-gradient-to-r from-[#38BDF8] via-[#38BDF8]/40 to-transparent" />
        <p className="mt-4 font-montserrat text-sm leading-relaxed text-gray-600">
          {message}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] px-6 py-3 font-orbitron text-sm font-bold tracking-wider text-white shadow-lg transition-all hover:shadow-cyan-400/30 active:scale-[0.98]"
        >
          TUTUP
        </button>
      </div>
    </div>
  );
}

/* ─── Decorative Hexagon SVG ─── */
function HexagonDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 104"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 0L113.923 31V73L60 104L6.07695 73V31L60 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      <path
        d="M60 12L104 37V67L60 92L16 67V37L60 12Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      <path
        d="M60 24L94 43V61L60 80L26 61V43L60 24Z"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.15"
      />
    </svg>
  );
}

/* ─── Circuit Line Decoration ─── */
function CircuitLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 120"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.3" stroke="#44EAB0" strokeWidth="0.85">
        <path d="M0 60H60L90 30H200L230 60H350" />
        <path d="M50 90H120L150 60H180" />
        <path d="M100 30L130 60H200L240 20H280" />
        <path d="M350 60H420L450 90H550" />
        <path d="M400 30H460L490 60H600" />
        <path d="M200 90H260L290 60H350" />
        <circle cx="60" cy="60" r="3" fill="#44EAB0" />
        <circle cx="200" cy="30" r="3" fill="#44EAB0" />
        <circle cx="350" cy="60" r="3" fill="#44EAB0" />
        <circle cx="180" cy="60" r="3" fill="#44EAB0" />
        <circle cx="280" cy="20" r="3" fill="#44EAB0" />
        <circle cx="550" cy="90" r="3" fill="#44EAB0" />
        <circle cx="600" cy="60" r="3" fill="#44EAB0" />
      </g>
    </svg>
  );
}

export default function ExermindStartPage() {
  const [userName, setUserName] = useState<string>("Contestant");
  const [teamName, setTeamName] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasClickedStart, setHasClickedStart] = useState(false);

  // Token states
  const [tokenInput, setTokenInput] = useState("");
  const [showTokenError, setShowTokenError] = useState(false);
  const [tokenErrorMsg, setTokenErrorMsg] = useState("");

  const router = useRouter();

  useEffect(() => {
    const initStartData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, full_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserName(
            profile.display_name ||
            profile.full_name ||
            user.user_metadata?.display_name ||
            "Contestant",
          );
        }

        // Fetch user's team details
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("team_name")
          .eq("leader_user_id", user.id)
          .single();

        if (teamError || !team) {
          console.error("Team fetch error:", teamError);
          router.replace("/home");
          return;
        }
        setTeamName(team.team_name || "Team");

        try {
          const stateResult = await getExamState();
          const state = normalizeExamState(stateResult);
          const status = state?.session?.status;

          if (
            status === "IN_PROGRESS" &&
            (state?.powerUps.length === 3 || !EXERMIND_CONFIG.SKILLS_ACTIVE)
          ) {
            router.replace("/exermind/exam");
            return;
          }

          if (status === "SUBMITTED" || status === "COMPLETED") {
            router.replace("/exermind/finish");
            return;
          }
        } catch (stateErr) {
          console.warn("Exam state check skipped/failed:", stateErr);
        }
      } catch (err: any) {
        console.error("Error initializing start page:", err);
        router.replace("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    initStartData();
  }, [router]);

  /* Token validation — configured via EXERMIND_CONFIG.EXAM_TOKEN */
  const handleAttemptTest = () => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setTokenErrorMsg(
        "Silakan hubungi pihak panitia atau masukkan token yang benar.",
      );
      setShowTokenError(true);
      return;
    }

    const validToken = (EXERMIND_CONFIG.EXAM_TOKEN || "").trim().toUpperCase();
    if (trimmed.toUpperCase() !== validToken) {
      setTokenErrorMsg(
        "Silakan hubungi pihak panitia atau masukkan token yang benar.",
      );
      setShowTokenError(true);
      return;
    }

    // Token valid → if skills are enabled, show power-up selection; otherwise start immediately
    if (EXERMIND_CONFIG.SKILLS_ACTIVE) {
      setHasClickedStart(true);
    } else {
      handleStartExam(["TIME_FREEZE", "HINT", "DOUBLE_POINTS"]);
    }
  };

  const handleStartExam = async (selectedPowerups: PowerUpType[]) => {
    setIsStarting(true);
    setErrorMessage(null);

    try {
      const result = await startSession({
        powerUps: selectedPowerups,
      });

      if (!result.success) {
        setErrorMessage(result.message || "Failed to start exam session.");
        setIsStarting(false);
        return;
      }

      // Redirect to main exam runner page
      router.push("/exermind/exam");
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setErrorMessage(err?.message || "Unexpected error starting session.");
      setIsStarting(false);
    }
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A2540] text-white">
        <div className="flex flex-col items-center space-y-4 font-orbitron">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#38BDF8] border-t-transparent" />
          <p className="text-sm tracking-wider text-[#38BDF8]/80">
            Loading ExerMind...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Power-Up Selection Screen ─── */
  if (hasClickedStart) {
    return (
      <div className="relative flex min-h-screen flex-col bg-[#0A2540] text-white">
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-white/10 bg-[#032340] px-6 py-4">
          <div>
            <h2 className="font-orbitron text-lg font-bold text-[#38BDF8]">
              EXERMIND PREPARATION
            </h2>
            <p className="font-montserrat text-xs text-gray-400">
              Contestant: <span className="text-white">{userName}</span> | Team:{" "}
              <span className="text-white">{teamName}</span>
            </p>
          </div>
          {isStarting && (
            <div className="flex items-center space-x-2 text-sm text-[#38BDF8]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Initiating Session...</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mx-auto mt-4 max-w-xl rounded-md border border-red-500 bg-red-900/40 p-4 text-center text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <ChoosePower
          disabled={isStarting}
          onComplete={(powers: PowerUpType[]) => {
            handleStartExam(powers);
          }}
        />
      </div>
    );
  }

  /* ─── Main Welcome Screen ─── */
  return (
    <>
      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes floatHex {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(3deg);
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#4A7AB5] via-[#5E8EC4] to-[#7FAED6]">
        {/* ═══ EXERTION Logo Header — pinned top-left ═══ */}
        <div className="absolute left-0 top-0 z-20">
          <Image
            src="/exermind/exertion-logo.svg"
            alt="EXERTION Logo"
            width={1467}
            height={170}
            className="h-auto w-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* ═══ Main Dark Panel — exact SVG shape ═══ */}
        <div className="relative z-10 mx-auto flex w-full flex-1 items-center justify-center">
          {/* SVG panel as exact background shape */}
          <div className="relative h-full w-full">
            {/* The bg-panel SVG used as the exact shape — fill the container */}
            <div className="absolute inset-0">
              <Image
                src="/exermind/bg-panel.svg"
                alt=""
                fill
                className="object-fill"
                priority
              />
            </div>

            {/* ═══ Content Area — centered over the SVG panel ═══ */}
            <div className="relative z-10 flex min-h-[500px] flex-col items-center justify-center px-6 py-16 sm:min-h-[600px] sm:px-12 lg:px-20">
              <div
                className="w-full max-w-xl text-center"
                style={{ animation: "slideInRight 0.6s ease-out" }}
              >
                {/* Title */}
                <h1 className="font-orbitron text-3xl font-extrabold leading-tight tracking-wider text-white sm:text-4xl lg:text-5xl">
                  WELCOME TO{" "}
                  <span className="bg-gradient-to-r from-[#38BDF8] to-[#7DD3FC] bg-clip-text text-transparent">
                    EXERMIND
                  </span>
                </h1>

                {/* Team name */}
                <p className="mt-3 font-orbitron text-xl font-bold tracking-wide text-white/90 sm:text-2xl">
                  ({teamName})
                </p>

                {/* Attempt info */}
                <div className="mt-8 space-y-1">
                  <p className="font-montserrat text-sm font-semibold tracking-wide text-white/80 sm:text-base">
                    Attemps Allowed:{" "}
                    <span className="text-white">1</span>
                  </p>
                  <p className="font-montserrat text-xs text-white/70 sm:text-sm">
                    This quiz will open on Hari, Tanggal, Jam
                  </p>
                </div>

                {/* Duration & Number of questions */}
                <div className="mt-4 flex items-center justify-center gap-10 font-montserrat text-xs tracking-wider text-white/70 sm:text-sm">
                  <span>60 minute</span>
                  <span>30 number</span>
                </div>

                {/* ─── Edit icon ─── */}
                <div className="mt-2 flex justify-center text-white/50">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>

                {/* ─── Token Input ─── */}
                <div
                  className="mt-6"
                  style={{ animation: "slideInUp 0.6s ease-out 0.2s both" }}
                >
                  <div className="relative">
                    <input
                      id="token-input"
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAttemptTest();
                      }}
                      placeholder="PUT TOKEN HERE"
                      className="w-full rounded-full bg-white px-8 py-4 pr-14 font-montserrat text-sm font-medium tracking-wider text-[#094466] placeholder-[#094466]/50 shadow-lg outline-none ring-2 ring-transparent transition-all focus:ring-[#38BDF8]/50 sm:text-base"
                    />
                  </div>
                </div>

                {/* ─── Attempt Test Button ─── */}
                <div
                  className="mt-5"
                  style={{ animation: "slideInUp 0.6s ease-out 0.35s both" }}
                >
                  <button
                    id="attempt-test-btn"
                    onClick={handleAttemptTest}
                    disabled={isStarting}
                    className="w-full rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] px-10 py-4 font-orbitron text-sm font-bold tracking-[0.2em] text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-cyan-400/40 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  >
                    ATTEMPT TEST
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Token Error Modal ═══ */}
        {showTokenError && (
          <TokenErrorModal
            message={tokenErrorMsg}
            onClose={() => setShowTokenError(false)}
          />
        )}
      </div>
    </>
  );
}
