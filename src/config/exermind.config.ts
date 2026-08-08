export const EXERMIND_CONFIG = {
  /**
   * MAXIMUM_QUESTION_COUNT: Maximum number of questions assigned to an exam session.
   */
  MAXIMUM_QUESTION_COUNT: 60,

  /**
   * ROUND_TYPE: "PRELIMINARY" | "FINAL"
   * Determines which round's questions are seeded and randomized into an exam session.
   */
  ROUND_TYPE: "PRELIMINARY" as "PRELIMINARY" | "FINAL",

  /**
   * EXAM_TOKEN: Passkey token required on the start page to access and attempt the exam.
   */
  EXAM_TOKEN: "EXERMIND2026",

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
};
