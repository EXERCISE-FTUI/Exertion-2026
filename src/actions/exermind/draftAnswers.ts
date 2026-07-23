"use server";

import { redis, isRedisConfigured } from "@/utils/redis";

export const saveDraftAnswers = async ({
  sessionId,
  answers,
}: {
  sessionId: string;
  answers: Record<string, string>;
}) => {
  try {
    if (!sessionId) return { error: true, message: "Missing sessionId." };

    if (!isRedisConfigured || !redis) {
      // Redis credentials not configured yet, fallback gracefully
      return { success: true, fallback: true };
    }

    const redisKey = `exermind:draft:${sessionId}`;
    // Save answers map to Redis with 2-hour TTL (7200 seconds)
    await redis.set(redisKey, JSON.stringify(answers), { ex: 7200 });

    return { success: true };
  } catch (err: any) {
    console.error("Error saving draft answers to Upstash Redis:", err);
    return { error: true, message: err?.message || "Failed to save draft." };
  }
};

export const getDraftAnswers = async ({ sessionId }: { sessionId: string }) => {
  try {
    if (!sessionId) return { success: true, answers: {} };

    if (!isRedisConfigured || !redis) {
      return { success: true, answers: {}, fallback: true };
    }

    const redisKey = `exermind:draft:${sessionId}`;
    const data = await redis.get<string | Record<string, string>>(redisKey);

    let answers: Record<string, string> = {};
    if (typeof data === "string") {
      try {
        answers = JSON.parse(data);
      } catch (e) {
        answers = {};
      }
    } else if (typeof data === "object" && data !== null) {
      answers = data;
    }

    return { success: true, answers };
  } catch (err: any) {
    console.error("Error fetching draft answers from Upstash Redis:", err);
    return { success: true, answers: {}, fallback: true };
  }
};
