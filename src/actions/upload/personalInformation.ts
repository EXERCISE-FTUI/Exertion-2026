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
    institute: string;
    leaderName: string;
    leaderWhatsappNumber: string;
    member1Name?: string;
    member1WhatsappNumber?: string;
    member2Name?: string;
    member2WhatsappNumber?: string;
    competitionId: string;
    competition: string;
}

export const personalInformation = async (
    input: TeamInput
): Promise<ActionResponse> => {
    const supabase = await createClient();

    const {
        groupName,
        institute,
        leaderName,
        leaderWhatsappNumber,
        member1Name,
        member1WhatsappNumber,
        member2Name,
        member2WhatsappNumber,
        competitionId,
        competition
    } = input;

    if (!groupName || !institute || !leaderName || !leaderWhatsappNumber) {
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

    if (member1WhatsappNumber && !whatsappRegex.test(member1WhatsappNumber)) {
        return {
            error: true,
            message: "Please enter a valid WhatsApp number for member 1.",
        };
    }

    if (member2WhatsappNumber && !whatsappRegex.test(member2WhatsappNumber)) {
        return {
            error: true,
            message: "Please enter a valid WhatsApp number for member 2.",
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
        institute: institute,
        leader_name: leaderName,
        leader_whatsapp_number: leaderWhatsappNumber,
        member1_name: member1Name || null,
        member1_whatsapp_number: member1WhatsappNumber || null,
        member2_name: member2Name || null,
        member2_whatsapp_number: member2WhatsappNumber || null,
        competition_id: competitionId || null, // Ensure competitionId is always a string
        competition_name: competition || null, // Added to match the competition selection
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