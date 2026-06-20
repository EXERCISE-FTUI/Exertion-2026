import { z } from 'zod';
import { passwordMatchSchema } from '../validation/passwordMatchSchema';

export const formSchema = z
    .object({
        email: z.string().email(),
    })
    .and(passwordMatchSchema);