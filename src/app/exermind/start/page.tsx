"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ChoosePower from "../_components/ChoosePower";
import type { PowerUpType } from "../_components/powerup";
import { startSession } from "@/actions/exermind/startSession";
import { getExamState } from "@/actions/exermind/getExamState";
import { normalizeExamState } from "../_components/examState";

export default function ExermindStartPage() {
  const [userName, setUserName] = useState<string>("Contestant");
  const [teamName, setTeamName] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasClickedStart, setHasClickedStart] = useState(false);
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
          .select("team_name")
          .eq("leader_user_id", user.id)
          .single();

        if (teamError || !team) {
          console.error("Team fetch error:", teamError);
          setErrorMessage("No team found for current user.");
          return;
        }

        setTeamName(team.team_name || "Team");

        const stateResult = await getExamState();
        const state = normalizeExamState(stateResult);
        const status = state?.session?.status;

        if (status === "IN_PROGRESS" && state?.powerUps.length === 3) {
          router.replace("/exermind/exam");
          return;
        }

        if (status === "SUBMITTED" || status === "COMPLETED") {
          router.replace("/exermind/finish");
          return;
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
    <div className="relative flex min-h-screen flex-col justify-between bg-[#111417] text-white">
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
            <p className="font-montserrat pt-2 text-xs text-gray-400">
              Press the button below to prepare your power-ups and start the
              exam attempt.
            </p>
          </div>

          <button
            onClick={() => setHasClickedStart(true)}
            className="rounded-full border-2 border-white bg-[#88D6FA] px-10 py-3.5 font-orbitron text-base font-bold tracking-wide text-black shadow-xl transition-all hover:bg-sky-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Attempt
          </button>
        </div>
      ) : (
        /* Screen 2: Power-up Selection and Start Trigger */
        <ChoosePower
          disabled={isStarting}
          onComplete={(powers: PowerUpType[]) => {
            handleStartExam(powers);
          }}
        />
      )}
    </div>
  );
}
