"use server";

import { createClient } from "@/utils/supabase/server";

interface ActionResponse {
    message: string;
    success?: boolean;
    error?: boolean;
    data?: any;
}

const toDriveLink = (driveId: string | null): string | null => {
    if (!driveId) return null;
    return `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
};

export const saveDocuments = async (formData: FormData): Promise<ActionResponse> => {
    const supabase = await createClient();

    const teamId = formData.get('teamId') as string;
    const memberCount = parseInt(formData.get('memberCount') as string) || 1;

    // Leader
    const studentIdCardLink = toDriveLink(formData.get('studentIdCardDriveId') as string);
    const twibbonUploadLink = toDriveLink(formData.get('twibbonDriveId') as string);
    const instagramStoryLink = toDriveLink(formData.get('instagramStoryDriveId') as string);

    const member2StudentIdCardLink = memberCount >= 2 ? toDriveLink(formData.get('member2StudentIdCardDriveId') as string) : null;
    const member2TwibbonLink = memberCount >= 2 ? toDriveLink(formData.get('member2TwibbonDriveId') as string) : null;
    const member2InstagramStoryLink = memberCount >= 2 ? toDriveLink(formData.get('member2InstagramStoryDriveId') as string) : null;

    const member3StudentIdCardLink = memberCount >= 3 ? toDriveLink(formData.get('member3StudentIdCardDriveId') as string) : null;
    const member3TwibbonLink = memberCount >= 3 ? toDriveLink(formData.get('member3TwibbonDriveId') as string) : null;
    const member3InstagramStoryLink = memberCount >= 3 ? toDriveLink(formData.get('member3InstagramStoryDriveId') as string) : null;

    if (!teamId) {
        return { error: true, message: "Team ID is required." };
    }

    const updates: any = {};
    if (studentIdCardLink) updates.student_id_card_link = studentIdCardLink;
    if (twibbonUploadLink) updates.twibbon_upload_link = twibbonUploadLink;
    if (instagramStoryLink) updates.instagram_story_link = instagramStoryLink;
    if (member2StudentIdCardLink) updates.member2_student_id_card_link = member2StudentIdCardLink;
    if (member2TwibbonLink) updates.member2_twibbon_upload_link = member2TwibbonLink;
    if (member2InstagramStoryLink) updates.member2_instagram_story_link = member2InstagramStoryLink;
    if (member3StudentIdCardLink) updates.member3_student_id_card_link = member3StudentIdCardLink;
    if (member3TwibbonLink) updates.member3_twibbon_upload_link = member3TwibbonLink;
    if (member3InstagramStoryLink) updates.member3_instagram_story_link = member3InstagramStoryLink;

    if (Object.keys(updates).length > 0) {
        const { error } = await supabase
            .from('submission_documents')
            .update(updates)
            .eq('team_id', teamId);

        if (error) {
            console.error("Error saving documents to Supabase:", error);
            return { error: true, message: `Failed to save documents: ${error.message}` };
        }
    }

    return { success: true, message: "Documents saved successfully.", data: { teamId } };
};