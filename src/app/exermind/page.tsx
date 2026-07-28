"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { getExamState } from "@/actions/exermind/getExamState";
import { normalizeExamState } from "./_components/examState";

export default function ExermindRouteGate() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const routeSession = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        // Fetch team ID
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("id")
          .eq("leader_user_id", user.id)
          .single();

        if (teamError || !team) {
          router.push("/home");
          return;
        }

        const stateResult = await getExamState();
        const state = normalizeExamState(stateResult);
        const status = state?.session?.status;

        if (!status || status === "NOT_STARTED") {
          router.replace("/exermind/start");
        } else if (status === "IN_PROGRESS") {
          router.replace(
            state?.powerUps.length === 3 ? "/exermind/exam" : "/exermind/start",
          );
        } else if (status === "SUBMITTED" || status === "COMPLETED") {
          router.replace("/exermind/finish");
        } else {
          router.replace("/exermind/start");
        }
      } catch (err) {
        console.error("Route gate error:", err);
        router.push("/exermind/start");
      } finally {
        setLoading(false);
      }
    };

    routeSession();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#111417] text-white">
      <div className="flex flex-col items-center space-y-4 font-orbitron">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#88D6FA] border-t-transparent"></div>
        <p>Routing to ExerMind Session...</p>
      </div>
    </div>
  );
}
