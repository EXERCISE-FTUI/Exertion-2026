import type {
  ExamQuestion,
  ExamState,
  JsonValue,
  PowerUpType,
} from "@/lib/exermind/types";

type UnknownRecord = Record<string, unknown>;

export type ExamQuestionView = ExamQuestion;

export interface ExamPowerUpView {
  id: string;
  type: PowerUpType;
  used: boolean;
  questionId?: string;
  hint?: string;
  slot: number;
}

export interface ExamSessionView {
  id: string;
  teamId: string;
  status: string;
  expiresAt: string;
  submittedAt?: string;
  warningCount: number;
  isTimeFrozen?: boolean;
  freezeStartedAt?: string;
}

export interface ExamAnswerDetailView {
  completedAt?: string;
  isCorrect?: boolean;
  multiplier: number;
  earnedPoints: number;
  totalPoints: number;
  gamePoints: number;
}

export interface ExamStateView {
  session: ExamSessionView | null;
  questions: ExamQuestionView[];
  answers: Record<string, string>;
  answerDetails: Record<string, ExamAnswerDetailView>;
  completedQuestionIds: string[];
  powerUps: ExamPowerUpView[];
  questionMultipliers: Record<string, number>;
  currentQuestionId?: string;
  score: {
    earnedPoints: number;
    totalPoints: number;
    gameScore: number;
    multiplier: number;
  };
  isTimeFrozen: boolean;
  frozenQuestionId?: string;
  remainingSeconds: number | null;
}

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;

const isExamState = (value: unknown): value is ExamState => {
  const record = asRecord(value);
  return Boolean(
    record &&
      asRecord(record.session) &&
      Array.isArray(record.questions) &&
      asRecord(record.answers) &&
      Array.isArray(record.powerUps) &&
      asRecord(record.score),
  );
};

const extractExamState = (value: unknown): ExamState | null => {
  if (isExamState(value)) return value;

  const root = asRecord(value);
  if (!root) return null;
  if (isExamState(root.state)) return root.state;
  if (isExamState(root.data)) return root.data;

  const data = asRecord(root.data);
  return data && isExamState(data.state) ? data.state : null;
};

const answerAsString = (answer: JsonValue): string => {
  if (typeof answer === "string") return answer;
  if (answer === null || answer === undefined) return "";
  return typeof answer === "number" || typeof answer === "boolean"
    ? String(answer)
    : JSON.stringify(answer);
};

export const normalizeExamState = (value: unknown): ExamStateView | null => {
  const state = extractExamState(value);
  if (!state) return null;

  const answers = Object.fromEntries(
    Object.entries(state.answers).map(([questionId, answer]) => [
      questionId,
      answerAsString(answer.answer),
    ]),
  );
  const answerDetails = Object.fromEntries(
    Object.entries(state.answers).map(([questionId, answer]) => [
      questionId,
      {
        completedAt: answer.completedAt ?? undefined,
        isCorrect: answer.isCorrect ?? undefined,
        multiplier: answer.multiplier,
        earnedPoints: answer.earnedPoints,
        totalPoints: answer.totalPoints,
        gamePoints: answer.gamePoints,
      },
    ]),
  );
  const completedQuestionIds = Object.entries(state.answers).flatMap(
    ([questionId, answer]) => (answer.completedAt ? [questionId] : []),
  );
  const questionMultipliers = Object.fromEntries(
    Object.entries(state.answers).flatMap(([questionId, answer]) =>
      answer.multiplier > 1 ? [[questionId, answer.multiplier]] : [],
    ),
  );
  const currentQuestionId = state.currentQuestionId ?? undefined;

  return {
    session: {
      id: state.session.id,
      teamId: state.session.teamId,
      status: state.session.status,
      expiresAt: state.session.expiresAt,
      submittedAt: state.session.submittedAt ?? undefined,
      warningCount: 0,
      isTimeFrozen: Boolean(state.session.isTimeFrozen),
      freezeStartedAt: state.session.freezeStartedAt ?? undefined,
    },
    questions: state.questions,
    answers,
    answerDetails,
    completedQuestionIds,
    powerUps: state.powerUps.map((powerUp) => ({
      id: powerUp.id,
      slot: powerUp.slot,
      type: powerUp.type,
      used: powerUp.used,
      questionId: powerUp.questionId ?? undefined,
      hint: powerUp.hint ?? undefined,
    })),
    questionMultipliers,
    currentQuestionId,
    score: state.score,
    isTimeFrozen: state.session.isTimeFrozen,
    frozenQuestionId: state.session.isTimeFrozen
      ? currentQuestionId
      : undefined,
    remainingSeconds: state.session.remainingSeconds,
  };
};

export const getExamStatus = (value: unknown): string | undefined =>
  normalizeExamState(value)?.session?.status;

export const actionSucceeded = (value: unknown): boolean => {
  const root = asRecord(value);
  return root?.success === true;
};

export const getActionMessage = (value: unknown): string | undefined => {
  const root = asRecord(value);
  return typeof root?.message === "string" ? root.message : undefined;
};

export const getHintFromActivation = (value: unknown): string | undefined => {
  const root = asRecord(value);
  if (typeof root?.hint === "string") return root.hint;

  const state = extractExamState(value);
  return (
    state?.powerUps.find((powerUp) => powerUp.used && Boolean(powerUp.hint))
      ?.hint ?? undefined
  );
};

export const getMultiplierFromActivation = (
  value: unknown,
): number | undefined => extractExamState(value)?.score.multiplier;
