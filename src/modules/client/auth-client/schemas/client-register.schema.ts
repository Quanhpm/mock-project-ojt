import { z } from "zod"
import { mockUsers } from "@/mock/data/users.mock";

export const registerSchema = z.object({
    name: z.string().min(5, "Must be 5 characters"),
    phone: z.string().min(10, "Input 10 numbers").regex(/^[0-9]+$/, "No alphabet include"),
    email: z.string().min(1, "Input your email").email("Invalid email format"),
    password: z.string().min(8, "Password required 8 characters"),
}).refine(
    (data) => !mockUsers.some(u => u.email === data.email),
    {
        message: "Email is already used!",
        path: ["email"]
    }
);

export type RegisterFormValues = z.infer<typeof registerSchema>