import { NextResponse } from "next/server";
import { incrementWarningCount } from "@/actions/exermind/warningCount";
import { isRedisConfigured, redis } from "@/utils/redis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, event_type, timestamp, metadata } = body;

    let currentWarningCount = 0;

    // Automatically increment warning count in Upstash Redis for TAB_HIDDEN events
    if (session_id && event_type === "TAB_HIDDEN") {
      const warningRes = await incrementWarningCount({ sessionId: session_id });
      if (warningRes.success && warningRes.warningCount) {
        currentWarningCount = warningRes.warningCount;
      }
    }

    // Save real-time telemetry log entry to Upstash Redis
    if (isRedisConfigured && redis && session_id && event_type) {
      try {
        const logEntry = {
          id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          session_id,
          event_type,
          timestamp: new Date(timestamp || Date.now()).toISOString(),
          warning_count: currentWarningCount,
          metadata: metadata || {},
        };

        const redisKey = "exermind:telemetry:logs";
        await redis.lpush(redisKey, JSON.stringify(logEntry));
        await redis.ltrim(redisKey, 0, 499); // Keep latest 500 telemetry events
      } catch (redisErr) {
        console.error("Failed to write telemetry log to Redis:", redisErr);
      }
    }

    // Log telemetry event to server console output
    console.log(
      `[TELEMETRY LOG] Session: ${session_id} | Event: ${event_type} | Warnings: ${currentWarningCount} | Time: ${timestamp || Date.now()} | Meta:`,
      metadata || {},
    );

    return NextResponse.json(
      {
        success: true,
        warning_count: currentWarningCount,
        received_at: Date.now(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error processing telemetry payload:", error);
    return NextResponse.json(
      {
        error: true,
        message: "Invalid telemetry payload",
      },
      { status: 400 },
    );
  }
}
