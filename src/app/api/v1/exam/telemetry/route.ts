import { NextResponse } from "next/server";
import { incrementWarningCount } from "@/actions/exermind/warningCount";

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
