"use server";
import { createClient } from "@/utils/supabase/server";
import {
  emailSchema,
  newUserSchema,
  displayNameSchema,
} from "@/utils/validation/auth-schema";
import { passwordMatchSchema } from "@/utils/validation/passwordMatchSchema";
import { passwordSchema } from "@/utils/validation/passwordSchema";

export const signUpNewUser = async ({
  fullName,
  displayName,
  email,
  password,
  passwordConfirm,
}: {
  fullName: string;
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}) => {
  const emailValidation = emailSchema.safeParse({ email });
  if (!emailValidation.success) {
    return {
      error: true,
      message: emailValidation.error.issues[0]?.message ?? "An error occured",
    };
  }

  const passwordValidation = passwordSchema.safeParse(password);
  if (!passwordValidation.success) {
    return {
      error: true,
      message:
        passwordValidation.error.issues[0]?.message ?? "An error occured",
    };
  }

  const passwordMatchValidation = passwordMatchSchema.safeParse({
    password,
    passwordConfirm,
  });
  if (!passwordMatchValidation.success) {
    return {
      error: true,
      message:
        passwordMatchValidation.error.issues[0]?.message ?? "An error occured",
    };
  }

  const newUserValidation = newUserSchema.safeParse({
    email,
    password,
    passwordConfirm,
  });

  if (!newUserValidation.success) {
    return {
      error: true,
      message: newUserValidation.error.issues[0]?.message ?? "An error occured",
    };
  }

  const displayNameValidation = displayNameSchema.safeParse(displayName);

  if (!displayNameValidation.success) {
    return {
      error: true,
      message:
        displayNameValidation.error.issues[0]?.message ?? "An error occured",
    };
  }

  const supabase = await createClient();

  // Check if display_name already exists
  const { data: existingProfiles, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("display_name", displayName)
    .limit(1);

  if (checkError) {
    console.error("Display name check error:", checkError);
    return {
      error: true,
      message: "Failed to check username availability. Please try again.",
    };
  }

  if (existingProfiles && existingProfiles.length > 0) {
    console.log("Display name already in use:", displayName);
    return {
      error: true,
      message: "Username already in use",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/api/auth/callback`,
      data: {
        full_name: fullName,
        display_name: displayName,
      },
    },
  });
  if (error) {
    console.log(error);
    return {
      error: true,
      message: error.message,
    };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    console.log(data.user);
    return {
      error: true,
      message: "Email already in use",
    };
  }

  return {
    success: true,
    message: "Check your email for the confirmation link",
  };
};
