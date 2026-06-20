"use server"
import { createClient } from "@/utils/supabase/server";
import { passwordSchema } from "@/utils/validation/passwordSchema";

export const updatePassword = async ({ password }: { password: string; }) => {
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
        return {
            error: true,
            message: passwordValidation.error.issues[0]?.message ?? "An error occured",
        };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) {
        console.error("Error updating password:", error);
        return {
            error: true,
            message: error.message,
        };
    }

    return {
        success: true,
        message: "Password updated successfully",
    };
};