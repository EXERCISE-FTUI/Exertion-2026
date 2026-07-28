import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import { sanitizeQuestionContent } from "@/lib/exermind/powerUps";
import type { ActionFailure, ExamState, JsonValue } from "@/lib/exermind/types";
import { createClient } from "@/utils/supabase/server";

type RpcArguments = Record<string, unknown>;

export async function callExamRpc<T>(
  functionName: string,
  args?: RpcArguments,
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const result = await supabase
    .schema("exermind_exam")
    .rpc(functionName, args ?? {});

  return {
    data: (result.data as T | null) ?? null,
    error: result.error,
  };
}

export function rpcFailure(
  error: Pick<PostgrestError, "code" | "message"> | Error | unknown,
  fallbackMessage: string,
): ActionFailure {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : fallbackMessage;
  const match = rawMessage.match(/^(EXERMIND_[A-Z_]+):\s*([\s\S]*)$/);

  return {
    success: false,
    error: true,
    code:
      match?.[1] ??
      (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : "EXERMIND_RPC_ERROR"),
    message: match?.[2] || rawMessage || fallbackMessage,
  };
}

export function sanitizeExamState(state: ExamState): ExamState {
  return {
    ...state,
    questions: state.questions.map((question) => ({
      ...question,
      content: sanitizeQuestionContent(question.content),
    })),
    answers: Object.fromEntries(
      Object.entries(state.answers ?? {}).map(([questionId, answer]) => [
        questionId,
        {
          ...answer,
          answer: answer.answer as JsonValue,
        },
      ]),
    ),
  };
}

export function invalidInput(code: string, message: string): ActionFailure {
  return {
    success: false,
    error: true,
    code,
    message,
  };
}
