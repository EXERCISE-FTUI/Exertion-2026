import {
  POWER_UP_TYPES,
  type JsonValue,
  type PowerUpType,
} from "@/lib/exermind/types";

const POWER_UP_ALIASES: Readonly<Record<string, PowerUpType>> = {
  TIME_FREEZE: "TIME_FREEZE",
  "TIME-FREEZE": "TIME_FREEZE",
  "ADD-TIME": "TIME_FREEZE",
  ADD_TIME: "TIME_FREEZE",
  HINT: "HINT",
  DOUBLE_POINTS: "DOUBLE_POINTS",
  "DOUBLE-POINTS": "DOUBLE_POINTS",
};

export function normalizePowerUpType(value: unknown): PowerUpType | null {
  if (typeof value !== "string") return null;
  return POWER_UP_ALIASES[value.trim().toUpperCase()] ?? null;
}

export function validatePowerUpSelection(input: unknown): PowerUpType[] {
  if (!Array.isArray(input) || input.length !== 3) {
    throw new RangeError("Exactly three power-ups must be selected.");
  }

  return input.map((value) => {
    const normalized = normalizePowerUpType(value);
    if (!normalized || !POWER_UP_TYPES.includes(normalized)) {
      throw new TypeError(`Unsupported power-up: ${String(value)}`);
    }
    return normalized;
  });
}

export function sanitizeQuestionContent(
  content: unknown,
): Record<string, JsonValue> {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return {};
  }

  const { hint: _hiddenHint, ...safeContent } = content as Record<
    string,
    JsonValue
  >;
  return safeContent;
}

export function normalizeAnswerKey(value: unknown): string {
  if (value === null || value === undefined) return "";

  let normalized = String(value).trim().toLowerCase();
  if (normalized.startsWith("opt_") || normalized.startsWith("opt-")) {
    normalized = normalized.slice(4);
  }
  return normalized;
}

export function extractCorrectAnswer(solution: unknown): string | null {
  if (typeof solution === "string") return solution;
  if (!solution || typeof solution !== "object" || Array.isArray(solution)) {
    return null;
  }

  const value = solution as Record<string, unknown>;
  const answer =
    value.correct_option_id ??
    value.correct_option ??
    value.correct_answer_id ??
    value.correct_answer ??
    value.answer_id ??
    value.answer ??
    value.key;

  return answer === null || answer === undefined ? null : String(answer);
}

export function answersMatch(answer: unknown, solution: unknown): boolean {
  const normalizedAnswer = normalizeAnswerKey(answer);
  const normalizedSolution = normalizeAnswerKey(extractCorrectAnswer(solution));
  return Boolean(
    normalizedAnswer &&
      normalizedSolution &&
      normalizedAnswer === normalizedSolution,
  );
}

export function getDoublePointsMultiplier(
  activatedDoublePoints: number,
): number {
  const count = Number.isFinite(activatedDoublePoints)
    ? Math.min(3, Math.max(0, Math.trunc(activatedDoublePoints)))
    : 0;
  return 2 ** count;
}

export function calculateQuestionScore({
  isCorrect,
  points,
  activatedDoublePoints = 0,
}: {
  isCorrect: boolean;
  points: number;
  activatedDoublePoints?: number;
}) {
  const totalPoints = Number.isFinite(points) && points > 0 ? points : 1;
  const multiplier = getDoublePointsMultiplier(activatedDoublePoints);
  const earnedPoints = isCorrect ? totalPoints : 0;

  return {
    earnedPoints,
    totalPoints,
    multiplier,
    gamePoints: earnedPoints * multiplier,
  };
}

export function calculateAccuracyScore(
  earnedPoints: number,
  totalPoints: number,
): number {
  if (!Number.isFinite(totalPoints) || totalPoints <= 0) return 0;
  const score = (Math.max(0, earnedPoints) / totalPoints) * 100;
  return Number(score.toFixed(2));
}

export function calculateFreezeExtensionMs({
  freezeStartedAt,
  completedAt,
}: {
  freezeStartedAt: Date | string | number;
  completedAt: Date | string | number;
}): number {
  const startedAt = new Date(freezeStartedAt).getTime();
  const endedAt = new Date(completedAt).getTime();
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return 0;
  return Math.max(0, endedAt - startedAt);
}

export function extendExpiryForFreeze({
  expiresAt,
  freezeStartedAt,
  completedAt,
}: {
  expiresAt: Date | string | number;
  freezeStartedAt: Date | string | number;
  completedAt: Date | string | number;
}): Date {
  const expiry = new Date(expiresAt);
  return new Date(
    expiry.getTime() +
      calculateFreezeExtensionMs({ freezeStartedAt, completedAt }),
  );
}

export function calculateRemainingSeconds({
  expiresAt,
  now = new Date(),
  freezeStartedAt,
}: {
  expiresAt: Date | string | number;
  now?: Date | string | number;
  freezeStartedAt?: Date | string | number | null;
}): number {
  const effectiveNow = freezeStartedAt ?? now;
  const remainingMs =
    new Date(expiresAt).getTime() - new Date(effectiveNow).getTime();
  if (!Number.isFinite(remainingMs)) return 0;
  return Math.max(0, Math.floor(remainingMs / 1000));
}
