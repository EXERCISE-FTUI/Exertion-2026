"use server";

import { redis, isRedisConfigured } from "@/utils/redis";

export const incrementWarningCount = async ({ sessionId }: { sessionId: string }) => {
  try {
    if (!sessionId) return { error: true, message: "Missing sessionId." };

    if (!isRedisConfigured || !redis) {
      return { success: true, warningCount: 1, fallback: true };
    }

    const redisKey = `exermind:warnings:${sessionId}`;
    const newCount = await redis.incr(redisKey);
    await redis.expire(redisKey, 7200); // 2-hour TTL

    return { success: true, warningCount: Number(newCount) };
  } catch (err: any) {
    console.error("Error incrementing warning count in Upstash Redis:", err);
    return { error: true, message: err?.message || "Failed to increment warning count." };
  }
};

export const getWarningCount = async ({ sessionId }: { sessionId: string }) => {
  try {
    if (!sessionId || !isRedisConfigured || !redis) {
      return { success: true, warningCount: 0 };
    }

    const redisKey = `exermind:warnings:${sessionId}`;
    const count = await redis.get<number | string>(redisKey);
    return { success: true, warningCount: count ? Number(count) : 0 };
  } catch (err: any) {
    console.error("Error getting warning count from Upstash Redis:", err);
    return { success: true, warningCount: 0 };
  }
};
