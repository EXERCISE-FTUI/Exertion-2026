"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { getActiveSession } from "@/actions/exermind/getActiveSession";

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

        // Fetch active session status
        const sessionRes = await getActiveSession(team.id);
        const session = sessionRes.session;

        if (!session || session.status === "NOT_STARTED") {
          router.push("/exermind/start");
        } else if (session.status === "IN_PROGRESS") {
          router.push("/exermind/exam");
        } else if (
          session.status === "SUBMITTED" ||
          session.status === "COMPLETED"
        ) {
          router.push("/exermind/finish");
        } else {
          router.push("/exermind/start");
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