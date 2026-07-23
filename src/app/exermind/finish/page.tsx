"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getActiveSession } from "@/actions/exermind/getActiveSession";

import { EXERMIND_CONFIG } from "@/config/exermind.config";

export default function ExermindFinishPage() {
  const [userName, setUserName] = useState<string>("Contestant");
  const [teamName, setTeamName] = useState<string>("");
  const [session, setSession] = useState<any | null>(null);
  const [submission, setSubmission] = useState<any | null>(null);
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
          router.push("/sign-in");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, full_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserName(profile.display_name || profile.full_name || "Contestant");
        }

        const { data: team } = await supabase
          .from("teams")
          .select("id, team_name")
          .eq("leader_user_id", user.id)
          .single();

        if (team) {
          setTeamName(team.team_name || "");
          const sessionRes = await getActiveSession(team.id);
          if (sessionRes.session) {
            setSession(sessionRes.session);
          }
          if (sessionRes.submission) {
            setSubmission(sessionRes.submission);
          }
        }
      } catch (err) {
        console.error("Error loading finish page data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFinishData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#111417] text-white">
        <div className="flex flex-col items-center space-y-4 font-orbitron">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#88D6FA] border-t-transparent"></div>
          <p>Loading Exam Status...</p>
        </div>
      </div>
    );
  }

  const scoreNum = submission?.score !== undefined ? Number(submission.score) : null;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#111417] p-6 text-white">
      <div className="relative flex w-full max-w-lg flex-col items-center justify-center space-y-6 rounded-2xl border border-gray-800 bg-[#161a1f] p-8 text-center shadow-2xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="font-orbitron text-2xl font-bold tracking-wider text-white md:text-3xl">
            EXAM COMPLETED!
          </h1>
          <p className="font-montserrat text-sm text-gray-300">
            Thank you, <span className="font-semibold text-[#88D6FA]">{userName}</span>!
          </p>
          {teamName && (
            <p className="font-montserrat text-xs text-gray-400">
              Team: <span className="text-white font-medium">{teamName}</span>
            </p>
          )}
        </div>

        {/* Conditional Card: ESSAY vs MCQ */}
        {submission?.submission_type === "ESSAY" ||
        EXERMIND_CONFIG.QUESTION_TYPE === "ESSAY" ||
        submission?.is_graded === false ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-[#88D6FA]/30 bg-[#042440] p-6 shadow-inner space-y-2 text-center">
            <span className="font-orbitron text-sm font-bold uppercase text-[#88D6FA]">
              Thank You!
            </span>
            <p className="font-montserrat text-xs text-gray-200 leading-relaxed">
              Your essay responses have been recorded successfully and submitted for evaluation.
            </p>
          </div>
        ) : scoreNum !== null ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-teal-500/30 bg-[#042440] p-6 shadow-inner space-y-1">
            <span className="font-orbitron text-xs font-semibold uppercase text-gray-400">
              Final Earned Score
            </span>
            <div className="font-orbitron text-4xl font-extrabold text-[#88D6FA]">
              {scoreNum}%
            </div>
            <span className="font-montserrat text-xs text-teal-300">
              {scoreNum >= 70 ? "Excellent Job!" : "Exam Submitted"}
            </span>
          </div>
        ) : null}

        <div className="w-full rounded-xl border border-gray-800 bg-[#111417] p-4 text-left font-montserrat text-xs space-y-2.5 text-gray-300">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span>Status:</span>
            <span className="font-bold text-teal-400 uppercase">
              {session?.status || "SUBMITTED"}
            </span>
          </div>
          {submission?.submission_type && (
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span>Grading Type:</span>
              <span className="text-gray-300 uppercase font-mono">
                {submission.submission_type}
              </span>
            </div>
          )}
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span>Recorded Warnings:</span>
            <span className={`font-mono font-bold ${session?.warning_count ? "text-yellow-400" : "text-gray-400"}`}>
              {session?.warning_count ?? 0}
            </span>
          </div>
          {session?.submitted_at && (
            <div className="flex justify-between">
              <span>Submitted At:</span>
              <span className="text-gray-400 font-mono">
                {new Date(session.submitted_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <Link
          href="/home"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#88D6FA] py-3.5 font-orbitron font-bold text-black transition hover:bg-sky-400 active:scale-95 shadow-lg text-sm tracking-wider uppercase"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}