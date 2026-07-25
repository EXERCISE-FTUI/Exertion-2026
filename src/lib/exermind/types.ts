export const POWER_UP_TYPES = ["TIME_FREEZE", "HINT", "DOUBLE_POINTS"] as const;

export type PowerUpType = (typeof POWER_UP_TYPES)[number];

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ExamQuestion {
  id: string;
  prompt: string;
  content: Record<string, JsonValue>;
  type: string;
}

export interface ExamAnswer {
  answer: JsonValue;
  completedAt: string | null;
  isCorrect: boolean | null;
  earnedPoints: number;
  totalPoints: number;
  gamePoints: number;
  multiplier: number;
}

export interface SessionPowerUp {
  id: string;
  slot: number;
  type: PowerUpType;
  used: boolean;
  activatedAt: string | null;
  questionId: string | null;
  hint: string | null;
}

export interface ExamSessionState {
  id: string;
  teamId: string;
  status: string;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  isTimeFrozen: boolean;
  freezeStartedAt: string | null;
  remainingSeconds: number;
}

export interface ExamScoreState {
  earnedPoints: number;
  totalPoints: number;
  gameScore: number;
  multiplier: number;
}

export interface ExamState {
  session: ExamSessionState;
  questions: ExamQuestion[];
  answers: Record<string, ExamAnswer>;
  powerUps: SessionPowerUp[];
  currentQuestionId: string | null;
  score: ExamScoreState;
}

export interface ExamResult {
  score: number | null;
  maxScore: number;
  earnedPoints: number;
  totalPoints: number;
  gameScore: number;
  correctCount: number;
  totalQuestions: number;
}

export type ActionFailure = {
  success: false;
  error: true;
  code: string;
  message: string;
};

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;
