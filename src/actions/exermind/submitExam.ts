"use server";

import { createClient } from "@/utils/supabase/server";
import { EXERMIND_CONFIG } from "@/config/exermind.config";
import { getWarningCount } from "@/actions/exermind/warningCount";
import { redis, isRedisConfigured } from "@/utils/redis";

export const submitExam = async ({
  sessionId,
  answers,
}: {
  sessionId: string;
  answers: Record<string, string>;
}) => {
  try {
    const supabase = await createClient();

    // 1. Fetch the active session
    const { data: session, error: sessionError } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      console.error("Error fetching session for submission:", sessionError);
      return { error: true, message: "Session not found." };
    }

    // 2. Check if already submitted
    if (session.status === "SUBMITTED" || session.status === "COMPLETED") {
      const { data: existingSubmission } = await supabase
        .schema("exermind_exam")
        .from("submissions")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      return {
        success: true,
        isExisting: true,
        score: existingSubmission?.score ?? 0,
        maxScore: existingSubmission?.max_score ?? 100,
        submission: existingSubmission,
      };
    }

    // 3. Extract question_order array
    const questionOrder: string[] = Array.isArray(session.question_order)
      ? session.question_order
      : [];

    if (questionOrder.length === 0) {
      return { error: true, message: "No questions associated with this session." };
    }

    // 4. Fetch questions with content and solution
    const { data: questions, error: qError } = await supabase
      .schema("exermind_exam")
      .from("questions")
      .select("id, prompt, content, solution")
      .in("id", questionOrder);

    if (qError || !questions) {
      console.error("Error fetching questions for grading:", qError);
      return { error: true, message: "Failed to load question solutions for grading." };
    }

    // 5. Auto-grading calculation with weighted points per question
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;

    questions.forEach((q) => {
      // Get weight points for this question (default to 1 if missing)
      const qPoints = Number(q.content?.points) || 1;
      totalPoints += qPoints;

      const userAns = answers[q.id];
      if (!userAns) return; // Unanswered

      // Normalize solution answer key from various JSON formats
      const solObj = q.solution;
      let correctKey: string | null = null;

      if (typeof solObj === "string") {
        correctKey = solObj;
      } else if (typeof solObj === "object" && solObj !== null) {
        correctKey =
          solObj.correct_option_id ||
          solObj.correct_option ||
          solObj.correct_answer_id ||
          solObj.correct_answer ||
          solObj.answer_id ||
          solObj.answer ||
          solObj.key ||
          null;
      }

      const normalizeKey = (val: any): string => {
        if (!val) return "";
        let str = String(val).trim().toLowerCase();
        if (str.startsWith("opt_") || str.startsWith("opt-")) {
          str = str.substring(4);
        }
        return str;
      };

      const normUser = normalizeKey(userAns);
      const normCorrect = normalizeKey(correctKey);

      if (normUser && normCorrect && normUser === normCorrect) {
        earnedPoints += qPoints;
        correctCount += 1;
      }
    });

    const isEssay = EXERMIND_CONFIG.QUESTION_TYPE === "ESSAY";
    const finalScore = isEssay
      ? null
      : totalPoints > 0
        ? Number(((earnedPoints / totalPoints) * 100).toFixed(2))
        : 0;
    const nowIso = new Date().toISOString();

    // 6. Insert submission record into exermind_exam.submissions
    const { data: submission, error: subError } = await supabase
      .schema("exermind_exam")
      .from("submissions")
      .insert({
        session_id: sessionId,
        answers: answers || {},
        score: finalScore,
        max_score: 100,
        is_graded: !isEssay,
        submission_type: isEssay ? "ESSAY" : "AUTO",
        submitted_at: nowIso,
      })
      .select("*")
      .single();

    if (subError) {
      console.error("Error saving submission:", subError);
      return {
        error: true,
        message: subError.message || "Failed to save submission result.",
      };
    }

    // 7. Retrieve final warning count from Upstash Redis and update exermind_exam.sessions
    const warningRes = await getWarningCount({ sessionId });
    const finalWarningCount = warningRes.warningCount || 0;

    const { error: updateError } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .update({
        status: "SUBMITTED",
        submitted_at: nowIso,
        warning_count: finalWarningCount,
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Error updating session status:", updateError);
    }

    // Clean up Redis warning key
    if (isRedisConfigured && redis) {
      redis.del(`exermind:warnings:${sessionId}`).catch(() => {});
    }

    return {
      success: true,
      score: finalScore,
      maxScore: 100,
      earnedPoints,
      totalPoints,
      correctCount,
      totalQuestions: questions.length,
      submission,
    };
  } catch (error: any) {
    console.error("Unexpected error submitting exam:", error);
    return {
      error: true,
      message: error?.message || "An unexpected error occurred during submission.",
    };
  }
};
