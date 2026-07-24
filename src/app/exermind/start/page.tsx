"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ChoosePower from "../_components/ChoosePower";
import type { PowerUpOption } from "../_components/powerup";
import { startSession } from "@/actions/exermind/startSession";
import { getActiveSession } from "@/actions/exermind/getActiveSession";

export default function ExermindStartPage() {
  const [userName, setUserName] = useState<string>("Contestant");
  const [teamName, setTeamName] = useState<string>("Loading...");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [competitionId, setCompetitionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasClickedStart, setHasClickedStart] = useState(false);
  const [sessionBlocked, setSessionBlocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initStartData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
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
          .select("id, team_name, competition_id")
          .eq("leader_user_id", user.id)
          .single();

        if (teamError || !team) {
          console.error("Team fetch error:", teamError);
          setErrorMessage("No team found for current user.");
          return;
        }

        setTeamName(team.team_name || "Team");
        setTeamId(team.id);
        setCompetitionId(team.competition_id);

        // Check if session status is IN_PROGRESS or SUBMITTED
        const sessionRes = await getActiveSession(team.id);
        if (sessionRes.session) {
          const status = sessionRes.session.status;
          if (status === "IN_PROGRESS") {
            setErrorMessage(
              "Your team's exam is currently IN_PROGRESS. You cannot initiate a new attempt from this start page.",
            );
            setSessionBlocked(true);
          } else if (status === "SUBMITTED" || status === "COMPLETED") {
            router.push("/exermind/finish");
            return;
          }
        }
      } catch (err: any) {
        console.error("Error initializing start page:", err);
        setErrorMessage("Failed to load user and team data.");
      } finally {
        setLoading(false);
      }
    };

    initStartData();
  }, [router]);

  const handleStartExam = async (selectedPowerups: PowerUpOption[]) => {
    if (!teamId || !competitionId) {
      setErrorMessage("Missing team or competition configuration.");
      return;
    }

    if (sessionBlocked) {
      return;
    }

    setIsStarting(true);
    setErrorMessage(null);

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(`exermind_active_tab_${teamId}`);
        localStorage.setItem(
          `exermind_powerups_${teamId}`,
          JSON.stringify(selectedPowerups),
        );
      }

      const result = await startSession({
        teamId,
        competitionId,
      });

      if (result.error || !result.success) {
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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#111417] text-white">
        <div className="flex flex-col items-center space-y-4 font-orbitron">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#88D6FA] border-t-transparent"></div>
          <p>Loading ExerMind Start Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#111417] text-white flex flex-col justify-between">
      {/* Header bar displaying user & team info */}
      <div className="flex w-full items-center justify-between border-b border-gray-800 bg-[#161a1f] px-6 py-4">
        <div>
          <h2 className="font-orbitron text-lg font-bold text-[#88D6FA]">
            EXERMIND PREPARATION
          </h2>
          <p className="font-montserrat text-xs text-gray-400">
            Contestant: <span className="text-white">{userName}</span> | Team:{" "}
            <span className="text-white">{teamName}</span>
          </p>
        </div>
        {isStarting && (
          <div className="flex items-center space-x-2 text-sm text-[#88D6FA]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Initiating Session...</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mx-auto mt-4 max-w-xl rounded-md border border-red-500 bg-red-900/40 p-4 text-center text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Screen 1: Start Attempt Welcome view */}
      {!hasClickedStart ? (
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 px-4 text-center">
          <div className="max-w-md space-y-3">
            <h1 className="font-orbitron text-3xl font-bold tracking-wider text-white">
              Welcome, <span className="text-[#88D6FA]">{userName}</span>!
            </h1>
            <p className="font-montserrat text-lg text-gray-300">
              Team: <span className="font-semibold text-white">{teamName}</span>
            </p>
            <p className="font-montserrat text-xs text-gray-400 pt-2">
              Press the button below to prepare your power-ups and start the exam attempt.
            </p>
          </div>

          <button
            disabled={sessionBlocked}
            onClick={() => {
              if (!sessionBlocked) setHasClickedStart(true);
            }}
            className="rounded-full bg-[#88D6FA] border-2 border-white px-10 py-3.5 font-orbitron font-bold text-black hover:bg-sky-400 active:scale-95 transition-all shadow-xl text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sessionBlocked ? "Exam Currently In Progress" : "Start Attempt"}
          </button>
        </div>
      ) : (
        /* Screen 2: Power-up Selection and Start Trigger */
        <ChoosePower
          onComplete={(powers: PowerUpOption[]) => {
            handleStartExam(powers);
          }}
        />
      )}
    </div>
  );
}