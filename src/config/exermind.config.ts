export const EXERMIND_CONFIG = {
  /**
   * MAXIMUM_QUESTION_COUNT: Maximum number of questions assigned to an exam session.
   */
  MAXIMUM_QUESTION_COUNT: 30,

  /**
   * MAXIMUM_ESSAY_QUESTION_COUNT: Maximum number of essay questions allowed per exam session.
   */
  MAXIMUM_ESSAY_QUESTION_COUNT: 5,

  /**
   * ROUND_TYPE: "PRELIMINARY" | "FINAL" | "TEST"
   * Determines which round's questions are seeded and randomized into an exam session.
   */
  ROUND_TYPE: "PRELIMINARY" as "PRELIMINARY" | "FINAL" | "TEST",

  /**
   * IS_TEST_QUESTION: If true, selects questions tagged with "TEST" round category.
   */
  IS_TEST_QUESTION: false,

  /**
   * EXAM_TOKEN: Passkey token required on the start page to access and attempt the exam.
   */
  EXAM_TOKEN: "PENYISIHAN1",

  /**
   * MAX_WARNING_COUNT: Maximum allowable warning count (anti-cheat placeholder).
   */
  MAX_WARNING_COUNT: 3,

  /**
   * ANTICHEAT_ACTIVE: Use for testing. Helps enable/disable anticheat mechanisms like screen detection, etc.
   */
  ANTICHEAT_ACTIVE: true,

  /**
   * EXAM_DURATION_MINUTES: Default exam duration in minutes.
   */
  EXAM_DURATION_MINUTES: 60,

  /* 
  * SKILLS_ACTIVE: Toggle whether skills / power-ups are enabled in the exam.
  */
  SKILLS_ACTIVE: false,

  /**
   * LOCKED_SEQUENCE: If true, questions must be answered sequentially and get locked upon pressing next.
   * If false, contestants can freely navigate back/forth and modify any answer before submitting.
   */
  LOCKED_SEQUENCE: false,

  /**
   * UPSTASH REDIS CREDENTIALS (FALLBACK IF ENV VARS UNSET ON PRODUCTION HOST)
   */
  UPSTASH_REDIS_REST_URL: "https://cuddly-grouse-80401.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "gQAAAAAAAToRAAIgcDEyNGFlYTY4NmJmOTA0NzJiYjI1ZTAyNzk3MDFjNmZmNw",
};

/**
 * Returns "TEST" if IS_TEST_QUESTION is true, otherwise returns EXERMIND_CONFIG.ROUND_TYPE.
 */
export function getActiveRound(): string {
  return EXERMIND_CONFIG.IS_TEST_QUESTION ? "TEST" : EXERMIND_CONFIG.ROUND_TYPE;
}
