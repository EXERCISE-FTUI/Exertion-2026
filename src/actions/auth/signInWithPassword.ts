"use server"
import { createClient } from "@/utils/supabase/server";
import { emailSchema } from "@/utils/validation/auth-schema";
import { passwordSchema } from "@/utils/validation/passwordSchema";

export const signInWithPassword = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}) => {
    const emailValidation = emailSchema.safeParse({ email });
    if (!emailValidation.success) {
        return {
            error: true,
            message: emailValidation.error.issues[0]?.message ?? "An error occured",
        };
    }
    const passwordValidation = passwordSchema.safeParse( password );
    if (!passwordValidation.success) {
        return {
            error: true,
            message: passwordValidation.error.issues[0]?.message ?? "An error occured",
        };
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Error signing in with email:", error);
        return {
            error: true,
            message: error.message,
        };
    }

    if (user) {
        return {
            success: true,
            message: "Sign-in successful",
        };
    }
    console.error("Error signing in with email:", error);
    return {
        error: true,
        message: "Unknown error",
    };

};