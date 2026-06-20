"use server"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const signInWithGoogle = async () => {
    const supabase = await createClient();
    const auth_callback_url = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/api/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: auth_callback_url,
        },
    });
    if (error) {
        console.error("Error signing in with Google:", error);
    }
    if (data.url) {
        console.log(data);
        redirect(data.url);
    }
}