"use server";

import { createClient } from "@/utils/supabase/server";
import { redis, isRedisConfigured } from "@/utils/redis";

export const incrementWarningCount = async ({ sessionId }: { sessionId: string }) => {
  try {
    if (!sessionId) return { error: true, message: "Missing sessionId." };

    let redisCount: number | null = null;

    // 1. Increment in Upstash Redis if configured
    if (isRedisConfigured && redis) {
      try {
        const redisKey = `exermind:warnings:${sessionId}`;
        const count = await redis.incr(redisKey);
        await redis.expire(redisKey, 7200); // 2-hour TTL
        redisCount = Number(count);
      } catch (err) {
        console.error("Redis increment Warning count failed, using DB fallback:", err);
      }
    }

    // 2. Increment and persist in Supabase PostgreSQL exermind_exam.sessions
    const supabase = await createClient();

    // Fetch current warning_count from DB
    const { data: sessionData } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .select("warning_count")
      .eq("id", sessionId)
      .maybeSingle();

    const currentDbCount = sessionData?.warning_count || 0;
    const finalCount = redisCount !== null ? Math.max(redisCount, currentDbCount + 1) : currentDbCount + 1;

    await supabase
      .schema("exermind_exam")
      .from("sessions")
      .update({ warning_count: finalCount })
      .eq("id", sessionId);

    return { success: true, warningCount: finalCount, fallback: !isRedisConfigured };
  } catch (err: any) {
    console.error("Error incrementing warning count:", err);
    return { error: true, message: err?.message || "Failed to increment warning count." };
  }
};

export const getWarningCount = async ({ sessionId }: { sessionId: string }) => {
  try {
    if (!sessionId) return { success: true, warningCount: 0 };

    let redisCount: number | null = null;

    // 1. Check Upstash Redis if configured
    if (isRedisConfigured && redis) {
      try {
        const redisKey = `exermind:warnings:${sessionId}`;
        const count = await redis.get<number | string>(redisKey);
        if (count !== null && count !== undefined) {
          redisCount = Number(count);
        }
      } catch (err) {
        console.error("Redis getWarningCount failed, reading from DB:", err);
      }
    }

    // 2. Fetch from Supabase PostgreSQL exermind_exam.sessions
    const supabase = await createClient();
    const { data: sessionData } = await supabase
      .schema("exermind_exam")
      .from("sessions")
      .select("warning_count")
      .eq("id", sessionId)
      .maybeSingle();

    const dbCount = sessionData?.warning_count || 0;
    const finalCount = redisCount !== null ? Math.max(redisCount, dbCount) : dbCount;

    return { success: true, warningCount: finalCount };
  } catch (err: any) {
    console.error("Error getting warning count:", err);
    return { success: true, warningCount: 0 };
  }
};
