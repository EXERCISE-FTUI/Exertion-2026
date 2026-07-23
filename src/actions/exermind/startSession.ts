"use server";

import { createClient } from "@/utils/supabase/server";
import { EXERMIND_CONFIG } from "@/config/exermind.config";

export const startSession = async ({
  teamId,
  competitionId,
}: {
  teamId: string;
  competitionId: string;
}) => {
  try {
    const supabase = await createClient();

    // Check if session already exists for this team_id
    const { data: existingSession, error: fetchError } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .select("*")
      .eq("team_id", teamId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing session:", fetchError);
      return {
        error: true,
        message: "Failed to check existing session status.",
      };
    }

    // If session already exists for this team, return an error blocking re-entry / duplicate session
    if (existingSession) {
      return {
        error: true,
        message:
          "Your team has already initiated an exam session and is not allowed to start another attempt.",
      };
    }

    // Fetch questions filtered by configured QUESTION_TYPE
    let { data: questions, error: qError } = await supabase
      .schema("exermind_exam")
      .from("questions")
      .select("id")
      .eq("type", EXERMIND_CONFIG.QUESTION_TYPE);

    // Fallback: If no questions match the specific type filter, fetch all available questions
    if (!questions || questions.length === 0) {
      const { data: allQuestions } = await supabase
        .schema("exermind_exam")
        .from("questions")
        .select("id");
      questions = allQuestions || [];
    }

    if (qError && (!questions || questions.length === 0)) {
      console.error("Error fetching questions for session creation:", qError);
      return {
        error: true,
        message: "Failed to fetch question pool.",
      };
    }

    if (!questions || questions.length === 0) {
      return {
        error: true,
        message: "No questions available in database to start exam.",
      };
    }

    // Fisher-Yates shuffle algorithm to randomize question order
    const questionIds = questions.map((q) => q.id);
    for (let i = questionIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
    }

    // Cap question count to configured MAXIMUM_QUESTION_COUNT
    const selectedQuestionIds = questionIds.slice(
      0,
      EXERMIND_CONFIG.MAXIMUM_QUESTION_COUNT,
    );

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + EXERMIND_CONFIG.EXAM_DURATION_MINUTES * 60 * 1000,
    );

    // Insert new session record into exermind_exam.sessions
    const { data: newSession, error: insertError } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .insert({
        team_id: teamId,
        competition_id: competitionId,
        status: "IN_PROGRESS",
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        question_order: selectedQuestionIds,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Error inserting new session:", insertError);
      return {
        error: true,
        message: insertError.message || "Failed to create new session.",
      };
    }

    return {
      success: true,
      isExisting: false,
      session: newSession,
    };
  } catch (error: any) {
    console.error("Unexpected error starting session:", error);
    return {
      error: true,
      message: error?.message || "An unexpected error occurred.",
    };
  }
};
