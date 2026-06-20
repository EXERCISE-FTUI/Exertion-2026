"use server"
import { createClient } from "@/utils/supabase/server";
import { emailSchema } from "@/utils/validation/auth-schema";

export const resetPassword = async ({ email }: { email: string }) => {
    const emailValidation = emailSchema.safeParse({ email });
    if (!emailValidation.success) {
        return {
            error: true,
            message: emailValidation.error.issues[0]?.message ?? "An error occured",
        };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/api/auth/callback?next=/update-password`,
        // redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/update-password`,
    });

    if (error) {
        console.error("Error sending password reset email:", error);
        return {
            error: true,
            message: error.message,
        };
    }

    return {
        success: true,
        message: "Password reset email sent",
    };
};