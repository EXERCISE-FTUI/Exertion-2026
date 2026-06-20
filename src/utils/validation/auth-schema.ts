import { z } from "zod";
import { passwordMatchSchema } from "@/utils/validation/passwordMatchSchema";

export const emailSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const newUserSchema = z
  .object({
    email: z.string().email(),
  })
  .and(passwordMatchSchema);

export const passwordSchema = z
  .string()
  .min(6, "Password must contain at least 6 characters");

export const codeSchema = z
  .object({
    code: z.string(),
  })
  .strict();

export const tokenSchema = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
  })
  .strict();

export const displayNameSchema = z.string();
