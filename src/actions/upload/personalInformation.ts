"use server";
import { createClient } from "@/utils/supabase/server";

interface ActionResponse {
    message: string;
    success?: boolean;
    error?: boolean;
    data?: any;
}

interface TeamInput {
    groupName: string;
    leaderName: string;
    leaderInstitute: string;
    leaderEmail: string;
    leaderWhatsappNumber: string;
    memberCount: number;
    member2Name?: string;
    member2Institute?: string;
    member3Name?: string;
    member3Institute?: string;
    competitionId: string;
    competition: string;
}

export const personalInformation = async (
    input: TeamInput
): Promise<ActionResponse> => {
    const supabase = await createClient();

    const {
        groupName,
        leaderName,
        leaderInstitute,
        leaderEmail,
        leaderWhatsappNumber,
        memberCount,
        member2Name,
        member2Institute,
        member3Name,
        member3Institute,
        competitionId,
        competition,
    } = input;

    if (!groupName || !leaderName || !leaderInstitute || !leaderEmail || !leaderWhatsappNumber) {
        return {
            error: true,
            message: "Please fill in all required team information fields.",
        };
    }

    const whatsappRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!whatsappRegex.test(leaderWhatsappNumber)) {
        return {
            error: true,
            message: "Please enter a valid WhatsApp number for the team leader.",
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
        return {
            error: true,
            message: "Please enter a valid email address for the team leader.",
        };
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("Authentication Error:", authError?.message || "User not found.");
        return { error: true, message: "User not authenticated. Please log in again." };
    }

    const teamDataToUpsert = {
        leader_user_id: user.id,
        team_name: groupName,
        leader_name: leaderName,
        leader_institute: leaderInstitute,
        leader_email: leaderEmail,
        leader_whatsapp_number: leaderWhatsappNumber,
        member_count: memberCount,
        member2_name: member2Name || null,
        member2_institute: member2Institute || null,
        member3_name: member3Name || null,
        member3_institute: member3Institute || null,
        competition_id: competitionId || null,
        competition_name: competition || null,
    };

    const { data: upsertedTeam, error: upsertError } = await supabase
        .from("teams")
        .upsert(teamDataToUpsert, {
            onConflict: "leader_user_id",
            ignoreDuplicates: false,
        })
        .select("id")
        .single();

    if (upsertError) {
        console.error("Error upserting team information:", upsertError);
        return {
            error: true,
            message: `Failed to save team information: ${upsertError.message}`,
        };
    }

    console.log("team id: " + upsertedTeam.id);
    return {
        success: true,
        message: "Team information saved successfully (created or updated).",
        data: { teamId: upsertedTeam.id },
    };
};