"use server";

import { createClient } from "@/utils/supabase/server";

export interface TelemetrySessionItem {
  sessionId: string;
  teamId: string;
  teamName: string;
  leaderName: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  submittedAt: string | null;
  totalQuestions: number;
  answeredCount: number;
  powerUps: string[];
  score: number | null;
  gameScore: number | null;
  submissionType: string | null;
  isGraded: boolean | null;
}

export interface TelemetryLogEvent {
  id: string;
  timestamp: string;
  teamName: string;
  eventType: "INFO" | "POWER_UP" | "ANSWER" | "SUBMIT" | "WARNING";
  message: string;
  details?: string;
}

export interface RedisTelemetryStatus {
  isConfigured: boolean;
  isConnected: boolean;
  message: string;
}

export interface AdminTelemetryResult {
  success: boolean;
  error?: string;
  redisStatus: RedisTelemetryStatus;
  stats: {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalAnswersLogged: number;
    averageScore: number;
  };
  sessions: TelemetrySessionItem[];
  logs: TelemetryLogEvent[];
}

export async function getAdminTelemetry(): Promise<AdminTelemetryResult> {
  // 0. Test Upstash Redis Health
  const { isRedisConfigured, redis } = await import("@/utils/redis");
  let redisStatus: RedisTelemetryStatus = {
    isConfigured: isRedisConfigured,
    isConnected: false,
    message: isRedisConfigured
      ? "Configured, checking connection..."
      : "UPSTASH_REDIS_REST_URL unconfigured. Running in Direct PostgreSQL DB Fallback Mode.",
  };

  if (isRedisConfigured && redis) {
    try {
      await redis.ping();
      redisStatus.isConnected = true;
      redisStatus.message = "Upstash Redis is ONLINE and healthy.";
    } catch (err: any) {
      redisStatus.isConnected = false;
      redisStatus.message = `Upstash Redis PING failed: ${err?.message || "Connection refused"}. Direct DB Fallback Active.`;
    }
  }

  try {
    const supabase = await createClient();

    // 1. Fetch all sessions with team & leader profile data
    const { data: rawSessions, error: sessionsError } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .select(`
        id,
        team_id,
        status,
        started_at,
        expires_at,
        question_order
      `)
      .order("started_at", { ascending: false });

    if (sessionsError || !rawSessions) {
      console.error("Error fetching admin telemetry sessions:", sessionsError);
      return {
        success: false,
        error: sessionsError?.message || "Failed to fetch exam sessions.",
        redisStatus,
        stats: { totalSessions: 0, activeSessions: 0, completedSessions: 0, totalAnswersLogged: 0, averageScore: 0 },
        sessions: [],
        logs: [],
      };
    }

    const sessionIds = rawSessions.map((s) => s.id);
    const teamIds = Array.from(new Set(rawSessions.map((s) => s.team_id)));

    // 2. Fetch Teams & Profiles
    const { data: teams } = await supabase
      .from("teams")
      .select("id, team_name, leader_user_id")
      .in("id", teamIds.length > 0 ? teamIds : ["00000000-0000-0000-0000-000000000000"]);

    const teamMap = new Map<string, { name: string; leaderId: string }>();
    const leaderIds: string[] = [];

    (teams || []).forEach((t) => {
      teamMap.set(t.id, { name: t.team_name || "Unknown Team", leaderId: t.leader_user_id });
      if (t.leader_user_id) leaderIds.push(t.leader_user_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, full_name")
      .in("id", leaderIds.length > 0 ? leaderIds : ["00000000-0000-0000-0000-000000000000"]);

    const leaderNameMap = new Map<string, string>();
    (profiles || []).forEach((p) => {
      leaderNameMap.set(p.id, p.display_name || p.full_name || "Contestant");
    });

    // 3. Fetch Session Answers
    const { data: rawAnswers } = await supabase
      .schema("exermind_exam")
      .from("session_answers")
      .select("session_id, question_id, answer, completed_at, updated_at")
      .in("session_id", sessionIds.length > 0 ? sessionIds : ["00000000-0000-0000-0000-000000000000"]);

    const answerCounts = new Map<string, number>();
    (rawAnswers || []).forEach((a) => {
      if (a.answer !== null && a.answer !== "null") {
        answerCounts.set(a.session_id, (answerCounts.get(a.session_id) || 0) + 1);
      }
    });

    // 4. Fetch Session Powerups
    const { data: rawPowerups } = await supabase
      .schema("exermind_exam")
      .from("session_powerups")
      .select("session_id, power_up_type, activated_at")
      .in("session_id", sessionIds.length > 0 ? sessionIds : ["00000000-0000-0000-0000-000000000000"]);

    const powerupsMap = new Map<string, string[]>();
    (rawPowerups || []).forEach((p) => {
      const existing = powerupsMap.get(p.session_id) || [];
      if (!existing.includes(p.power_up_type)) {
        existing.push(p.power_up_type);
      }
      powerupsMap.set(p.session_id, existing);
    });

    // 5. Fetch Submissions
    const { data: rawSubmissions } = await supabase
      .schema("exermind_exam")
      .from("submissions")
      .select("session_id, score, game_score, submitted_at, submission_type, is_graded")
      .in("session_id", sessionIds.length > 0 ? sessionIds : ["00000000-0000-0000-0000-000000000000"]);

    const submissionMap = new Map<string, {
      score: number | null;
      gameScore: number | null;
      submittedAt: string | null;
      submissionType: string | null;
      isGraded: boolean | null;
    }>();

    (rawSubmissions || []).forEach((sub) => {
      submissionMap.set(sub.session_id, {
        score: sub.score,
        gameScore: sub.game_score,
        submittedAt: sub.submitted_at,
        submissionType: sub.submission_type,
        isGraded: sub.is_graded,
      });
    });

    // 6. Build Session Items & Logs
    const sessions: TelemetrySessionItem[] = [];
    const logs: TelemetryLogEvent[] = [];
    let activeSessionsCount = 0;
    let completedSessionsCount = 0;
    let totalScoreSum = 0;
    let scoredCount = 0;

    rawSessions.forEach((s) => {
      const teamInfo = teamMap.get(s.team_id);
      const teamName = teamInfo?.name || `Team (${s.team_id.slice(0, 8)})`;
      const leaderName = teamInfo?.leaderId ? (leaderNameMap.get(teamInfo.leaderId) || "Contestant") : "Contestant";
      const totalQuestions = Array.isArray(s.question_order) ? s.question_order.length : 60;
      const answeredCount = answerCounts.get(s.id) || 0;
      const powerUps = powerupsMap.get(s.id) || [];
      const sub = submissionMap.get(s.id);

      if (s.status === "IN_PROGRESS") activeSessionsCount++;
      if (s.status === "SUBMITTED" || s.status === "COMPLETED") {
        completedSessionsCount++;
        if (sub?.score !== null && sub?.score !== undefined) {
          totalScoreSum += Number(sub.score);
          scoredCount++;
        }
      }

      sessions.push({
        sessionId: s.id,
        teamId: s.team_id,
        teamName,
        leaderName,
        status: s.status,
        startedAt: s.started_at,
        expiresAt: s.expires_at,
        submittedAt: sub?.submittedAt || null,
        totalQuestions,
        answeredCount,
        powerUps,
        score: sub?.score ?? null,
        gameScore: sub?.gameScore ?? null,
        submissionType: sub?.submissionType ?? null,
        isGraded: sub?.isGraded ?? null,
      });

      // Log Event: Session Started
      logs.push({
        id: `start-${s.id}`,
        timestamp: s.started_at,
        teamName,
        eventType: "INFO",
        message: `Exam session initialized for ${teamName}`,
        details: `Questions: ${totalQuestions} | Leader: ${leaderName}`,
      });

      // Log Events: Power-ups
      powerUps.forEach((pu, idx) => {
        logs.push({
          id: `pu-${s.id}-${idx}`,
          timestamp: s.started_at,
          teamName,
          eventType: "POWER_UP",
          message: `Power-up assigned: ${pu}`,
          details: `Activated slot #${idx + 1}`,
        });
      });

      // Log Event: Submission
      if (sub?.submittedAt) {
        logs.push({
          id: `sub-${s.id}`,
          timestamp: sub.submittedAt,
          teamName,
          eventType: "SUBMIT",
          message: `Exam submitted by ${teamName}`,
          details: `Score: ${sub.score ?? "Pending Manual Review"} | Type: ${sub.submissionType ?? "AUTO"}`,
        });
      }
    });

    // Sort logs descending by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      success: true,
      redisStatus,
      stats: {
        totalSessions: rawSessions.length,
        activeSessions: activeSessionsCount,
        completedSessions: completedSessionsCount,
        totalAnswersLogged: (rawAnswers || []).length,
        averageScore: scoredCount > 0 ? Number((totalScoreSum / scoredCount).toFixed(2)) : 0,
      },
      sessions,
      logs,
    };
  } catch (err: any) {
    console.error("Unexpected error in getAdminTelemetry:", err);
    return {
      success: false,
      error: err?.message || "Unexpected error retrieving telemetry.",
      redisStatus,
      stats: { totalSessions: 0, activeSessions: 0, completedSessions: 0, totalAnswersLogged: 0, averageScore: 0 },
      sessions: [],
      logs: [],
    };
  }
}
