"use server";

import { createClient } from "@/utils/supabase/server";

export const getActiveSession = async (teamId: string) => {
  try {
    const supabase = await createClient();

    const { data: activeSession, error } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .select("*")
      .eq("team_id", teamId)
      .maybeSingle();

    let submission = null;
    if (
      activeSession &&
      (activeSession.status === "SUBMITTED" || activeSession.status === "COMPLETED")
    ) {
      const { data: subData } = await supabase
        .schema("exermind_exam")
        .from("submissions")
        .select("*")
        .eq("session_id", activeSession.id)
        .maybeSingle();

      submission = subData;
    }

    return {
      success: true,
      session: activeSession,
      submission,
    };
  } catch (err: any) {
    console.error("Unexpected error getting active session:", err);
    return {
      error: true,
      message: err?.message || "Failed to fetch session status.",
    };
  }
};
