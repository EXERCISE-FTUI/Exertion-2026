"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getExamState } from "@/actions/exermind/getExamState";
import { createClient } from "@/utils/supabase/client";
import { EXERMIND_CONFIG } from "@/config/exermind.config";
import Final from "../_components/Final";
import {
  actionSucceeded,
  getActionMessage,
  normalizeExamState,
  type ExamStateView,
} from "../_components/examState";
import "../entry.css";

export default function ExermindExamPage() {
  const [loading, setLoading] = useState(true);
  const [examState, setExamState] = useState<ExamStateView | null>(null);
  const [teamName, setTeamName] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dualAccessDetected, setDualAccessDetected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let activeLockKey: string | null = null;
    let unloadHandler: (() => void) | null = null;

    const initExamRunner = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("id, team_name")
          .eq("leader_user_id", user.id)
          .single();

        if (teamError || !teamData) {
          router.replace("/home");
          return;
        }

        const [{ data: profile }, stateResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, full_name")
            .eq("id", user.id)
            .maybeSingle(),
          getExamState(),
        ]);

        if (!stateResult.success || !stateResult.session) {
          router.replace("/exermind/start");
          return;
        }

        const state = normalizeExamState(stateResult);
        if (!state?.session || state.session.status === "NOT_STARTED") {
          router.replace("/exermind/start");
          return;
        }

        if (
          state.session.status === "SUBMITTED" ||
          state.session.status === "COMPLETED"
        ) {
          router.replace("/exermind/finish");
          return;
        }

        if (state.powerUps.length !== 3 && EXERMIND_CONFIG.SKILLS_ACTIVE) {
          router.replace("/exermind/start");
          return;
        }

        if (state.questions.length === 0) {
          setErrorMessage("No exam questions are available for this session.");
          return;
        }

        setUserName(
          profile?.display_name ||
            profile?.full_name ||
            user.user_metadata?.display_name ||
            "Contestant",
        );
        setTeamName(teamData?.team_name || "Team");
        setExamState(state);

        let tabId = sessionStorage.getItem("exermind_tab_id");
        if (!tabId) {
          tabId = crypto.randomUUID();
          sessionStorage.setItem("exermind_tab_id", tabId);
        }

        const lockKey = `exermind_active_tab_${teamData?.id ?? "test"}`;
        activeLockKey = lockKey;
        const existingLock = localStorage.getItem(lockKey);

        if (existingLock) {
          try {
            const parsed = JSON.parse(existingLock) as {
              tabId?: string;
              timestamp?: number;
            };
            if (
              parsed.tabId &&
              parsed.tabId !== tabId &&
              typeof parsed.timestamp === "number" &&
              Date.now() - parsed.timestamp < 4_000
            ) {
              setDualAccessDetected(true);
              return;
            }
          } catch {
            localStorage.removeItem(lockKey);
          }
        }

        const writeHeartbeat = () =>
          localStorage.setItem(
            lockKey,
            JSON.stringify({ tabId, timestamp: Date.now() }),
          );

        writeHeartbeat();
        heartbeatTimer = setInterval(writeHeartbeat, 2_000);

        if ("BroadcastChannel" in window) {
          broadcastChannel = new BroadcastChannel(
            `exermind_channel_${teamData?.id ?? "test"}`,
          );
          broadcastChannel.postMessage({
            type: "PING_EXAM_TAB",
            tabId,
          });
          broadcastChannel.onmessage = (event) => {
            if (
              event.data?.type === "PING_EXAM_TAB" &&
              event.data.tabId !== tabId
            ) {
              broadcastChannel?.postMessage({
                type: "PONG_EXAM_TAB",
                tabId,
              });
            } else if (
              event.data?.type === "PONG_EXAM_TAB" &&
              event.data.tabId !== tabId
            ) {
              setDualAccessDetected(true);
            }
          };
        }

        unloadHandler = () => localStorage.removeItem(lockKey);
        window.addEventListener("beforeunload", unloadHandler);
      } catch (error) {
        console.error("Error running exam workspace:", error);
        setErrorMessage("Unexpected error loading the exam workspace.");
      } finally {
        setLoading(false);
      }
    };

    initExamRunner();

    return () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      broadcastChannel?.close();
      if (unloadHandler) {
        window.removeEventListener("beforeunload", unloadHandler);
      }
      if (activeLockKey) localStorage.removeItem(activeLockKey);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#111417] text-white">
        <div className="flex flex-col items-center space-y-4 font-orbitron">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#88D6FA] border-t-transparent" />
          <p>Loading Exam Workspace...</p>
        </div>
      </div>
    );
  }

  if (dualAccessDetected) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#111417] p-6 text-white">
        <div className="max-w-lg space-y-4 rounded-xl border border-yellow-500 bg-yellow-950/40 p-8 text-center shadow-2xl">
          <h2 className="font-orbitron text-2xl font-bold tracking-wide text-yellow-400 uppercase">
            Dual Access Detected
          </h2>
          <p className="font-montserrat text-sm leading-relaxed text-gray-200">
            This exam session is already open in another browser tab or window.
            Close this tab and continue in the original one.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !examState) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#111417] p-6 text-white">
        <div className="max-w-md space-y-4 rounded-lg border border-red-500 bg-red-900/30 p-6 text-center">
          <h2 className="font-orbitron text-xl font-bold text-red-400">
            Exam Workspace Error
          </h2>
          <p className="text-sm text-gray-200">
            {errorMessage || "The exam state could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => router.replace("/exermind")}
            className="rounded-full bg-[#88D6FA] px-6 py-2 text-sm font-semibold text-black hover:bg-sky-400"
          >
            Reload exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(0deg,#0B8071_-42.99%,#38405F_47.89%,#111417_117.2%)]">
      <Final initialState={examState} teamName={teamName} userName={userName} />
    </div>
  );
}
