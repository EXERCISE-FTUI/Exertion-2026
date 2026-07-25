import { describe, expect, it } from "vitest";
import {
  answersMatch,
  calculateAccuracyScore,
  calculateFreezeExtensionMs,
  calculateQuestionScore,
  calculateRemainingSeconds,
  canReviewUsedHint,
  extendExpiryForFreeze,
  getDoublePointsMultiplier,
  isDoublePointsAlreadyActive,
  normalizeAnswerKey,
  normalizePowerUpType,
  sanitizeQuestionContent,
  validatePowerUpSelection,
} from "./powerUps";

describe("power-up selection", () => {
  it("accepts exactly three power-ups and preserves duplicates", () => {
    expect(validatePowerUpSelection(["HINT", "hint", "HINT"])).toEqual([
      "HINT",
      "HINT",
      "HINT",
    ]);
  });

  it.each([
    [[]],
    [["HINT"]],
    [["HINT", "TIME_FREEZE"]],
    [["HINT", "TIME_FREEZE", "DOUBLE_POINTS", "HINT"]],
  ])("rejects a selection that does not contain three slots", (selection) => {
    expect(() => validatePowerUpSelection(selection)).toThrow(RangeError);
  });

  it("rejects unsupported power-up names", () => {
    expect(() =>
      validatePowerUpSelection(["HINT", "TIME_FREEZE", "FIFTY_FIFTY"]),
    ).toThrow(TypeError);
  });

  it("normalizes current and legacy type names", () => {
    expect(normalizePowerUpType("double-points")).toBe("DOUBLE_POINTS");
    expect(normalizePowerUpType("add-time")).toBe("TIME_FREEZE");
    expect(normalizePowerUpType("unknown")).toBeNull();
  });
});

describe("used hint availability", () => {
  const usedHint = {
    type: "HINT" as const,
    used: true,
    hint: "Review the circuit law.",
    activatedQuestionId: "question-a",
  };

  it("allows reviewing a used hint only on its original question", () => {
    expect(
      canReviewUsedHint({
        ...usedHint,
        currentQuestionId: "question-a",
      }),
    ).toBe(true);
    expect(
      canReviewUsedHint({
        ...usedHint,
        currentQuestionId: "question-b",
      }),
    ).toBe(false);
  });

  it("does not make unused or empty hints reviewable", () => {
    expect(
      canReviewUsedHint({
        ...usedHint,
        used: false,
        currentQuestionId: "question-a",
      }),
    ).toBe(false);
    expect(
      canReviewUsedHint({
        ...usedHint,
        hint: null,
        currentQuestionId: "question-a",
      }),
    ).toBe(false);
  });
});

describe("question secrecy and answer grading", () => {
  it("removes the hint without mutating the stored question content", () => {
    const content = {
      hint: "The answer starts with E.",
      points: 5,
      options: ["A", "B"],
    };

    expect(sanitizeQuestionContent(content)).toEqual({
      points: 5,
      options: ["A", "B"],
    });
    expect(content.hint).toBe("The answer starts with E.");
  });

  it("returns an empty safe object for malformed content", () => {
    expect(sanitizeQuestionContent(null)).toEqual({});
    expect(sanitizeQuestionContent(["hint"])).toEqual({});
  });

  it("matches supported solution shapes after normalizing option prefixes", () => {
    expect(answersMatch(" opt_A ", { correct_option_id: "a" })).toBe(true);
    expect(answersMatch("OPT-b", { answer: "B" })).toBe(true);
    expect(answersMatch("A", { key: "B" })).toBe(false);
    expect(answersMatch("", { key: "A" })).toBe(false);
    expect(normalizeAnswerKey(null)).toBe("");
  });
});

describe("double points and score separation", () => {
  it.each([
    [0, 1],
    [1, 2],
    [2, 2],
    [3, 2],
  ])("maps %i activations to a %ix multiplier", (uses, multiplier) => {
    expect(getDoublePointsMultiplier(uses)).toBe(multiplier);
  });

  it("caps the multiplier at 2x even if legacy data contains extra uses", () => {
    expect(getDoublePointsMultiplier(-3)).toBe(1);
    expect(getDoublePointsMultiplier(Number.POSITIVE_INFINITY)).toBe(1);
    expect(getDoublePointsMultiplier(99)).toBe(2);
  });

  it("blocks another unused Double Points while one is active", () => {
    expect(
      isDoublePointsAlreadyActive({
        type: "DOUBLE_POINTS",
        used: false,
        activeMultiplier: 2,
      }),
    ).toBe(true);
    expect(
      isDoublePointsAlreadyActive({
        type: "DOUBLE_POINTS",
        used: false,
        activeMultiplier: 1,
      }),
    ).toBe(false);
  });

  it("keeps accuracy points unmultiplied while multiplying game points", () => {
    expect(
      calculateQuestionScore({
        isCorrect: true,
        points: 5,
        activatedDoublePoints: 2,
      }),
    ).toEqual({
      earnedPoints: 5,
      totalPoints: 5,
      multiplier: 2,
      gamePoints: 10,
    });
    expect(calculateAccuracyScore(5, 10)).toBe(50);
  });

  it("awards no accuracy or game points for an incorrect answer", () => {
    expect(
      calculateQuestionScore({
        isCorrect: false,
        points: 5,
        activatedDoublePoints: 3,
      }),
    ).toEqual({
      earnedPoints: 0,
      totalPoints: 5,
      multiplier: 2,
      gamePoints: 0,
    });
  });
});

describe("time freeze", () => {
  const freezeStartedAt = "2026-07-25T00:10:00.000Z";
  const completedAt = "2026-07-25T00:12:30.000Z";
  const expiresAt = "2026-07-25T01:00:00.000Z";

  it("extends expiry by the full question-scoped freeze duration", () => {
    expect(calculateFreezeExtensionMs({ freezeStartedAt, completedAt })).toBe(
      150_000,
    );
    expect(
      extendExpiryForFreeze({
        expiresAt,
        freezeStartedAt,
        completedAt,
      }).toISOString(),
    ).toBe("2026-07-25T01:02:30.000Z");
  });

  it("does not subtract time while a freeze is active", () => {
    const atActivation = calculateRemainingSeconds({
      expiresAt,
      now: freezeStartedAt,
    });
    const afterRefresh = calculateRemainingSeconds({
      expiresAt,
      now: "2026-07-25T00:20:00.000Z",
      freezeStartedAt,
    });

    expect(afterRefresh).toBe(atActivation);
    expect(afterRefresh).toBe(3_000);
  });

  it("clamps reversed or expired durations at zero", () => {
    expect(
      calculateFreezeExtensionMs({
        freezeStartedAt: completedAt,
        completedAt: freezeStartedAt,
      }),
    ).toBe(0);
    expect(
      calculateRemainingSeconds({
        expiresAt,
        now: "2026-07-25T01:00:01.000Z",
      }),
    ).toBe(0);
  });
});
