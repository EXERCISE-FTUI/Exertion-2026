"use client";

import React, { useEffect, useState } from "react";
import "../entry.css";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Final from "../_components/Final";
import { getActiveSession } from "@/actions/exermind/getActiveSession";
import { getExamQuestions } from "@/actions/exermind/getExamQuestions";

export default function ExermindExamPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dualAccessDetected, setDualAccessDetected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    let heartbeatTimer: NodeJS.Timeout | null = null;
    let activeLockKey: string | null = null;

    const initExamRunner = async () => {
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
          setUserName(profile.display_name || profile.full_name || "Contestant");
        }

        // Fetch user's team ID
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("id, team_name")
          .eq("leader_user_id", user.id)
          .single();

        if (teamError || !team) {
          router.push("/home");
          return;
        }

        setTeamName(team.team_name || "Team");

        // Fetch active session status
        const sessionRes = await getActiveSession(team.id);
        const activeSession = sessionRes.session;

        // Edge Case 2: If session is NOT_STARTED or null, go to exermind/start
        if (!activeSession || activeSession.status === "NOT_STARTED") {
          router.push("/exermind/start");
          return;
        }

        // Edge Case 3: If session is SUBMITTED or COMPLETED, redirect to exermind/finish
        if (
          activeSession.status === "SUBMITTED" ||
          activeSession.status === "COMPLETED"
        ) {
          router.push("/exermind/finish");
          return;
        }

        setSession(activeSession);

        // Edge Case 4: Dual Access Detection (Multi-tab check)
        let myTabId = typeof window !== "undefined" ? sessionStorage.getItem("exermind_tab_id") : null;
        if (!myTabId && typeof window !== "undefined") {
          myTabId = Math.random().toString(36).substring(2, 10);
          sessionStorage.setItem("exermind_tab_id", myTabId);
        }

        const lockKey = `exermind_active_tab_${team.id}`;
        activeLockKey = lockKey;

        if (typeof window !== "undefined" && myTabId) {
          // Check localStorage heartbeat lock
          const existingLockStr = localStorage.getItem(lockKey);
          if (existingLockStr) {
            try {
              const existingLock = JSON.parse(existingLockStr);
              // If lock exists and was updated within the last 4 seconds from another tab (different tabId)
              if (
                existingLock.tabId &&
                existingLock.tabId !== myTabId &&
                Date.now() - existingLock.timestamp < 4000
              ) {
                setDualAccessDetected(true);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error("Error parsing tab lock:", e);
            }
          }

          // Write current tab heartbeat
          localStorage.setItem(
            lockKey,
            JSON.stringify({ tabId: myTabId, timestamp: Date.now() }),
          );

          // Setup continuous heartbeat
          heartbeatTimer = setInterval(() => {
            localStorage.setItem(
              lockKey,
              JSON.stringify({ tabId: myTabId, timestamp: Date.now() }),
            );
          }, 2000);

          // BroadcastChannel real-time tab collision detection
          if ("BroadcastChannel" in window) {
            broadcastChannel = new BroadcastChannel(`exermind_channel_${team.id}`);

            // Send PING to check for existing active tabs
            broadcastChannel.postMessage({ type: "PING_EXAM_TAB", tabId: myTabId });

            broadcastChannel.onmessage = (event) => {
              if (event.data?.type === "PING_EXAM_TAB" && event.data.tabId !== myTabId) {
                // Tab A hears Tab B's PING: Tab A replies with PONG to announce active exam
                broadcastChannel?.postMessage({ type: "PONG_EXAM_TAB", tabId: myTabId });
              } else if (
                event.data?.type === "PONG_EXAM_TAB" &&
                event.data.tabId !== myTabId
              ) {
                // Tab B hears Tab A's PONG: Dual access detected!
                setDualAccessDetected(true);
              }
            };
          }

          const handleUnload = () => {
            if (activeLockKey) localStorage.removeItem(activeLockKey);
          };
          window.addEventListener("beforeunload", handleUnload);
        }

        // Parse question_order array from active session
        const questionOrder: string[] = Array.isArray(activeSession.question_order)
          ? activeSession.question_order
          : [];

        if (questionOrder.length > 0) {
          const res = await getExamQuestions(questionOrder);
          if (res.success && res.questions) {
            setQuestions(res.questions);
          } else {
            console.error("Failed to load questions:", res.message);
            setErrorMessage("Failed to load exam questions.");
          }
        }
      } catch (err: any) {
        console.error("Error running exam workspace:", err);
        setErrorMessage("Unexpected error loading exam workspace.");
      } finally {
        setLoading(false);
      }
    };

    initExamRunner();

    return () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (broadcastChannel) broadcastChannel.close();
      if (typeof window !== "undefined" && activeLockKey) {
        localStorage.removeItem(activeLockKey);
      }
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#111417] text-white">
        <div className="flex flex-col items-center space-y-4 font-orbitron">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#88D6FA] border-t-transparent"></div>
          <p>Loading Exam Workspace...</p>
        </div>
      </div>
    );
  }

  // Edge Case 4 Screen: Dual Access Warning
  if (dualAccessDetected) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#111417] text-white p-6">
        <div className="rounded-xl border border-yellow-500 bg-yellow-950/40 p-8 text-center max-w-lg space-y-4 shadow-2xl">
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
          <h2 className="text-2xl font-bold font-orbitron text-yellow-400 uppercase tracking-wide">
            Dual Access Detected
          </h2>
          <p className="text-sm font-montserrat text-gray-200 leading-relaxed">
            This exam session is already open and running in another browser tab or window. To maintain exam integrity, dual access is prohibited.
          </p>
          <p className="text-xs font-montserrat text-gray-400">
            Please close this tab and continue in your original browser tab.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#111417] text-white p-6">
        <div className="rounded-lg border border-red-500 bg-red-900/30 p-6 text-center max-w-md space-y-4">
          <h2 className="text-xl font-bold font-orbitron text-red-400">Exam Workspace Error</h2>
          <p className="text-sm text-gray-200">{errorMessage}</p>
          <button
            onClick={() => router.push("/exermind/start")}
            className="rounded-full bg-[#88D6FA] px-6 py-2 text-black font-semibold text-sm hover:bg-sky-400"
          >
            Return to Start Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[linear-gradient(0deg,#0B8071_-42.99%,#38405F_47.89%,#111417_117.2%)]">
      <Final
        session={session}
        questions={questions}
        teamName={teamName}
        userName={userName}
      />
    </div>
  );
}
