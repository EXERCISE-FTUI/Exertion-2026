"use server";

import { createClient } from "@/utils/supabase/server";

interface ActionResponse {
    message: string;
    success?: boolean;
    error?: boolean;
    data?: any;
}

export const saveTaskSubmission = async (formData: FormData): Promise<ActionResponse> => {
    const supabase = await createClient();

    const teamId = formData.get('teamId') as string;
    const submissionDriveId = formData.get('submissionDriveId') as string;
    const submissionLink = submissionDriveId ? "https://drive.google.com/file/d/" + submissionDriveId + "/view?usp=sharing" : null;

    const { error } = await supabase
        .from('submission_documents')
        .upsert({
            team_id: teamId,
            task_link: submissionLink,
        }, { onConflict: 'team_id' });
    if (error) {
        const msg = "Error saving documents to Supabase:";
        console.error(msg, error);
        return { error: true, message: `Failed to save documents to Supabase: ${error.message}` };
    }
    return { success: true, message: "Documents saved successfully to Supabase.", data: { teamId } };
};