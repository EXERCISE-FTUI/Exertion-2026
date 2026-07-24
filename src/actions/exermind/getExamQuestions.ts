"use server";

import { createClient } from "@/utils/supabase/server";

export const getExamQuestions = async (questionIds: string[]) => {
  try {
    if (!questionIds || questionIds.length === 0) {
      return { success: true, questions: [] };
    }

    const supabase = await createClient();

    const { data: questions, error } = await supabase
      .schema("exermind_exam")
      .from("questions")
      .select("id, prompt, content, type")
      .in("id", questionIds);

    if (error) {
      console.error("Error fetching questions:", error);
      return { error: true, message: "Failed to fetch exam questions." };
    }

    // Sort questions according to the randomized sequence in questionIds
    const questionMap = new Map((questions || []).map((q) => [q.id, q]));
    const orderedQuestions = questionIds
      .map((id) => questionMap.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    return {
      success: true,
      questions: orderedQuestions,
    };
  } catch (error: any) {
    console.error("Unexpected error fetching questions:", error);
    return { error: true, message: error?.message || "Failed to load questions." };
  }
};
