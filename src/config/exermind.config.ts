export const EXERMIND_CONFIG = {
  /**
   * MAXIMUM_QUESTION_COUNT: Maximum number of questions assigned to an exam session.
   */
  MAXIMUM_QUESTION_COUNT: 60,

  /**
   * QUESTION_TYPE: "MCQ" | "ESSAY"
   * Determines question pool filtering, rendering (Options vs InputEsai), and auto-grading logic.
   */
  QUESTION_TYPE: "MCQ" as "MCQ" | "ESSAY",

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
};
