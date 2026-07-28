"use server";

import { getExamState } from "@/actions/exermind/getExamState";

/**
 * Compatibility wrapper for the pre-power-up screens. The optional team ID is
 * only a consistency check; ownership is always derived from auth.uid() by the
 * database RPC.
 */
export async function getActiveSession(teamId?: string) {
  const result = await getExamState();
  if (!result.success) return result;
  if (!result.data) {
    return {
      success: true as const,
      session: null,
      submission: null,
    };
  }

  const { session, questions } = result.data;
  if (teamId && teamId !== session.teamId) {
    return {
      success: false as const,
      error: true as const,
      code: "EXERMIND_SESSION_FORBIDDEN",
      message: "The requested session does not belong to this team.",
    };
  }

  return {
    success: true as const,
    session: {
      id: session.id,
      team_id: session.teamId,
      status: session.status,
      started_at: session.startedAt,
      expires_at: session.expiresAt,
      submitted_at: session.submittedAt,
      freeze_started_at: session.freezeStartedAt,
      question_order: questions.map((question) => question.id),
    },
    submission: null,
  };
}
