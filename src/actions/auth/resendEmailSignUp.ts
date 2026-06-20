"use server"
import { createClient } from "@/utils/supabase/server";
import { emailSchema } from "@/utils/validation/auth-schema";
import { redirect } from "next/navigation";

export const resendEmailSignUp = async (email: string) => {
    console.log("Resending sign-up email to:", email);
    const emailValidation = emailSchema.safeParse({ email });
    if (!emailValidation.success) {
        return {
            error: true,
            message: emailValidation.error.issues[0]?.message ?? "An error occured",
        };
    }
    const supabase = await createClient();
    const { data, error } = await supabase.auth.resend({
        type: "signup",
        email,
    });
    console.log(data)

    if (error) {
        console.error("Error resending sign-up email:", error);
        return {
            error: true,
            message: error.message,
        };
    }

    return {
        success: true,
        message: "Sign-up email resent",
    };
}