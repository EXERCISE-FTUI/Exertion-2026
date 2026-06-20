"use server";
import { createClient } from "@/utils/supabase/server";

interface ActionResponse {
    message: string;
    success?: boolean;
    error?: boolean;
    data?: any;
}

interface TeamInput {
    competitionId: string;
}

export const pickCompetition = async (
    input: TeamInput
): Promise<ActionResponse> => {
    const supabase = await createClient();

    const { competitionId } = input;

    if (!competitionId) {
        return {
            error: true,
            message: "Please fill in all required team and competition fields.",
        };
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("Auth Error:", authError);
        return { error: true, message: "User not authenticated. Please log in." };
    }

    const competitionDataToUpsert = {
        leader_user_id: user.id,
        competition_id: competitionId,
    }

    const { data: teamData, error: upsertError } = await supabase
        .from("teams")
        .upsert( competitionDataToUpsert, {
            onConflict: "leader_user_id, competition_id",
        })
        .select("id")
        .single();

    if (upsertError) {
        console.error("Error upserting team:", upsertError);
        return {
            error: true,
            message: `Failed to save team information: ${upsertError.message}`,
        };
    }

    return {
        success: true,
        message: "Team information saved successfully.",
        data: { teamId: teamData.id },
    };
};