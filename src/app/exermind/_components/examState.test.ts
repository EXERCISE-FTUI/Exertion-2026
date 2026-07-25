import { describe, expect, it } from "vitest";
import {
  actionSucceeded,
  getExamStatus,
  getHintFromActivation,
  normalizeExamState,
} from "./examState";

const examState = {
  session: {
    id: "session-1",
    teamId: "team-1",
    status: "IN_PROGRESS",
    startedAt: "2026-07-25T00:00:00.000Z",
    expiresAt: "2026-07-25T01:00:00.000Z",
    submittedAt: null,
    isTimeFrozen: true,
    freezeStartedAt: "2026-07-25T00:10:00.000Z",
    remainingSeconds: 3_000,
  },
  questions: [
    {
      id: "question-1",
      prompt: "First question",
      content: { points: 5, options: ["A", "B"] },
      type: "MCQ",
    },
    {
      id: "question-2",
      prompt: "Second question",
      content: { points: 3, options: ["A", "B"] },
      type: "MCQ",
    },
  ],
  answers: {
    "question-1": {
      answer: "A",
      completedAt: "2026-07-25T00:09:00.000Z",
      isCorrect: true,
      earnedPoints: 5,
      totalPoints: 5,
      gamePoints: 20,
      multiplier: 4,
    },
    "question-2": {
      answer: "B",
      completedAt: null,
      isCorrect: null,
      earnedPoints: 0,
      totalPoints: 0,
      gamePoints: 0,
      multiplier: 1,
    },
  },
  powerUps: [
    {
      id: "power-up-1",
      slot: 1,
      type: "HINT",
      used: true,
      activatedAt: "2026-07-25T00:08:00.000Z",
      questionId: "question-1",
      hint: "Read the first option carefully.",
    },
    {
      id: "power-up-2",
      slot: 2,
      type: "TIME_FREEZE",
      used: true,
      activatedAt: "2026-07-25T00:10:00.000Z",
      questionId: "question-2",
      hint: null,
    },
    {
      id: "power-up-3",
      slot: 3,
      type: "DOUBLE_POINTS",
      used: false,
      activatedAt: null,
      questionId: null,
      hint: null,
    },
  ],
  currentQuestionId: "question-2",
  score: {
    earnedPoints: 5,
    totalPoints: 8,
    gameScore: 20,
    multiplier: 1,
  },
} as const;

describe("exam state adapter", () => {
  it("normalizes the direct action payload and restores progress", () => {
    const normalized = normalizeExamState({
      success: true,
      data: examState,
    });

    expect(normalized).toMatchObject({
      answers: {
        "question-1": "A",
        "question-2": "B",
      },
      completedQuestionIds: ["question-1"],
      questionMultipliers: {
        "question-1": 4,
      },
      currentQuestionId: "question-2",
      isTimeFrozen: true,
      frozenQuestionId: "question-2",
      remainingSeconds: 3_000,
      score: {
        earnedPoints: 5,
        totalPoints: 8,
        gameScore: 20,
      },
    });
  });

  it("normalizes the nested state returned by submission", () => {
    const response = {
      success: true,
      data: {
        state: {
          ...examState,
          session: {
            ...examState.session,
            status: "SUBMITTED",
            isTimeFrozen: false,
          },
        },
        result: {
          score: 62.5,
          gameScore: 20,
        },
      },
    };

    expect(getExamStatus(response)).toBe("SUBMITTED");
    expect(normalizeExamState(response)?.isTimeFrozen).toBe(false);
  });

  it("reads activation feedback and rejects failure payloads", () => {
    expect(
      getHintFromActivation({
        success: true,
        data: examState,
        hint: "Fresh hint",
      }),
    ).toBe("Fresh hint");
    expect(actionSucceeded({ success: false, error: true })).toBe(false);
    expect(normalizeExamState({ success: true, data: null })).toBeNull();
  });
});
