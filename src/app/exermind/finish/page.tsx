"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getExamState } from "@/actions/exermind/getExamState";
import { createClient } from "@/utils/supabase/client";
import {
  actionSucceeded,
  getActionMessage,
  normalizeExamState,
  type ExamStateView,
} from "../_components/examState";

export default function ExermindFinishPage() {
  const [userName, setUserName] = useState("Contestant");
  const [teamName, setTeamName] = useState("");
  const [examState, setExamState] = useState<ExamStateView | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFinishData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        const [{ data: profile }, { data: team }, stateResult] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("display_name, full_name")
              .eq("id", user.id)
              .single(),
            supabase
              .from("teams")
              .select("team_name")
              .eq("leader_user_id", user.id)
              .single(),
            getExamState(),
          ]);

        if (!actionSucceeded(stateResult)) {
          setErrorMessage(
            getActionMessage(stateResult) || "Could not load the exam result.",
          );
          return;
        }

        const state = normalizeExamState(stateResult);
        if (!state?.session) {
          router.replace("/exermind/start");
          return;
        }

        if (state.session.status === "IN_PROGRESS") {
          router.replace("/exermind/exam");
          return;
        }

        setUserName(
          profile?.display_name ||
            profile?.full_name ||
            user.user_metadata?.display_name ||
            "Contestant",
        );
        setTeamName(team?.team_name || "");
        setExamState(state);
      } catch (error) {
        console.error("Error loading finish page data:", error);
        setErrorMessage("Could not load the exam result.");
      } finally {
        setLoading(false);
      }
    };

    loadFinishData();
  }, [router]);

  const result = useMemo(() => {
    if (!examState) return null;

    const details = Object.values(examState.answerDetails);
    const isGraded =
      examState.questions.some((question) => question.type !== "ESSAY") ||
      details.some((answer) => typeof answer.isCorrect === "boolean");
    const correctCount = details.filter(
      (answer) => answer.isCorrect === true,
    ).length;
    const totalQuestions = examState.questions.length;
    const accuracy =
      isGraded && examState.score.totalPoints > 0
        ? Number(
            (
              (examState.score.earnedPoints / examState.score.totalPoints) *
              100
            ).toFixed(2),
          )
        : null;

    return {
      isGraded,
      correctCount,
      totalQuestions,
      accuracy,
      gameScore: examState.score.gameScore,
      earnedPoints: examState.score.earnedPoints,
      totalPoints: examState.score.totalPoints,
    };
  }, [examState]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#111417] text-white">
        <div className="flex flex-col items-center space-y-4 font-orbitron">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#88D6FA] border-t-transparent" />
          <p>Loading Exam Result...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !examState || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111417] p-6 text-white">
        <div className="max-w-md space-y-4 rounded-xl border border-red-500/60 bg-red-950/30 p-6 text-center">
          <h1 className="font-orbitron text-xl font-bold text-red-300">
            Result unavailable
          </h1>
          <p className="font-montserrat text-sm text-gray-200">
            {errorMessage || "The exam result could not be loaded."}
          </p>
          <Link
            href="/exermind"
            className="inline-flex rounded-full bg-[#88D6FA] px-6 py-2 font-orbitron text-xs font-bold text-black"
          >
            Reload status
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#111417] p-6 text-white">
      <div className="relative flex w-full max-w-2xl flex-col items-center space-y-6 rounded-2xl border border-gray-800 bg-[#161a1f] p-8 text-center shadow-2xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
          <CheckCircle2 className="h-12 w-12" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="font-orbitron text-2xl font-bold tracking-wider text-white md:text-3xl">
            EXAM COMPLETED
          </h1>
          <p className="font-montserrat text-sm text-gray-300">
            Thank you,{" "}
            <span className="font-semibold text-[#88D6FA]">{userName}</span>.
          </p>
          {teamName && (
            <p className="font-montserrat text-xs text-gray-400">
              Team: <span className="font-medium text-white">{teamName}</span>
            </p>
          )}
        </div>

        {result.isGraded ? (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-[#88D6FA]/30 bg-[#042440] p-6">
              <span className="font-orbitron text-xs font-semibold text-gray-400 uppercase">
                Accuracy
              </span>
              <div className="mt-2 font-orbitron text-4xl font-extrabold text-[#88D6FA]">
                {result.accuracy}%
              </div>
              <p className="font-montserrat mt-2 text-xs text-gray-300">
                {result.correctCount} correct of {result.totalQuestions}
              </p>
            </section>

            <section className="rounded-xl border border-amber-300/30 bg-amber-950/20 p-6">
              <span className="font-orbitron text-xs font-semibold text-gray-400 uppercase">
                Game score
              </span>
              <div className="mt-2 font-orbitron text-4xl font-extrabold text-amber-300">
                {result.gameScore}
              </div>
              <p className="font-montserrat mt-2 text-xs text-gray-300">
                Includes Double Points multipliers
              </p>
            </section>
          </div>
        ) : (
          <section className="w-full space-y-2 rounded-xl border border-[#88D6FA]/30 bg-[#042440] p-6">
            <span className="font-orbitron text-sm font-bold text-[#88D6FA] uppercase">
              Responses recorded
            </span>
            <p className="font-montserrat text-xs leading-relaxed text-gray-200">
              Your essay responses were submitted for evaluation.
            </p>
          </section>
        )}

        {result.isGraded && (
          <div className="font-montserrat flex w-full justify-between rounded-xl border border-gray-800 bg-[#111417] p-4 text-xs text-gray-300">
            <span>Base points</span>
            <span className="font-mono font-bold text-white">
              {result.earnedPoints} / {result.totalPoints}
            </span>
          </div>
        )}

        <div className="font-montserrat w-full rounded-xl border border-gray-800 bg-[#111417] p-4 text-left text-xs text-gray-300">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span>Status</span>
            <span className="font-bold text-teal-400 uppercase">
              {examState.session?.status || "SUBMITTED"}
            </span>
          </div>
          {examState.session?.submittedAt && (
            <div className="flex justify-between pt-2">
              <span>Submitted at</span>
              <span className="font-mono text-gray-400">
                {new Date(examState.session.submittedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <Link
          href="/home"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#88D6FA] py-3.5 font-orbitron text-sm font-bold tracking-wider text-black uppercase shadow-lg transition hover:bg-sky-400 active:scale-95"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
