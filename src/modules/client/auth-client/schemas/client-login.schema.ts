import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().min(1,"Input your email").email("Invalid email format"),
    password: z.string().min(8,"Password required 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>