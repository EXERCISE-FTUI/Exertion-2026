"use server";

import { createClient } from "@/utils/supabase/server";

export const signOut = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    return null;
  }

  console.log("Sign out successful");
  return true; // balikin sesuatu untuk menandakan berhasil
};
