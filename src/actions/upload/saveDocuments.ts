"use server";

import { createClient } from "@/utils/supabase/server";

interface ActionResponse {
    message: string;
    success?: boolean;
    error?: boolean;
    data?: any;
}

export const saveDocuments = async (formData: FormData): Promise<ActionResponse> => {
    const supabase = await createClient();

    const competitionId = formData.get('competitionId') as string;
    const teamId = formData.get('teamId') as string;
    const groupName = formData.get('groupName') as string;
    const studentIdCardDriveId = formData.get('studentIdCardDriveId') as string;
    const studentIdCardLink = "https://drive.google.com/file/d/" + studentIdCardDriveId + "/view?usp=sharing";
    const twibbonDriveId = formData.get('twibbonDriveId') as string;
    const twibbonUploadLink = twibbonDriveId ? "https://drive.google.com/file/d/" + twibbonDriveId + "/view?usp=sharing" : null;
    const exertionFollowProofDriveId = formData.get('exertionUIPromptDriveId') as string;
    const exertionFollowProofLink = exertionFollowProofDriveId ? "https://drive.google.com/file/d/" + exertionFollowProofDriveId + "/view?usp=sharing" : null;
    const exerciseFtuiFollowProofDriveId = formData.get('exerciseFTUIPromptDriveId') as string;
    const exerciseFtuiFollowProofLink = exerciseFtuiFollowProofDriveId ? "https://drive.google.com/file/d/" + exerciseFtuiFollowProofDriveId + "/view?usp=sharing" : null;

    const { error } = await supabase
        .from('submission_documents')
        .upsert({
            team_id: teamId,
            student_id_card_link: studentIdCardLink,
            twibbon_upload_link: twibbonUploadLink,
            exertion_follow_proof_link: exertionFollowProofLink,
            exercise_ftui_follow_proof_link: exerciseFtuiFollowProofLink,
        }, { onConflict: 'team_id' });
    if (error) {
        const msg = "Error saving documents to Supabase:";
        console.error(msg, error);
        return { error: true, message: `Failed to save documents to Supabase: ${error.message}` };
    }
    return { success: true, message: "Documents saved successfully to Supabase.", data: { teamId } };
};