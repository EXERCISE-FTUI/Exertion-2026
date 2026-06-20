"use server";

import { createClient } from "@/utils/supabase/server";

interface ActionResponse {
    message: string;
    success?: boolean;
    error?: boolean;
    data?: any;
}

export const savePaymentProof = async (formData: FormData): Promise<ActionResponse> => {
    const supabase = await createClient();

    const teamId = formData.get("teamId") as string;
    const paymentProofDriveId = formData.get("paymentProofDriveId") as string;
    const paymentProofLink = paymentProofDriveId
        ? "https://drive.google.com/file/d/" + paymentProofDriveId + "/view?usp=sharing"
        : null;

    const { error } = await supabase
        .from("submission_documents")
        .upsert(
            {
                team_id: teamId,
                payment_proof: paymentProofLink,
            },
            { onConflict: "team_id" },
        );

    if (error) {
        const msg = "Error saving payment proof to Supabase:";
        console.error(msg, error);
        return { error: true, message: `Failed to save payment proof to Supabase: ${error.message}` };
    }

    return { success: true, message: "Payment proof saved successfully to Supabase.", data: { teamId } };
};
