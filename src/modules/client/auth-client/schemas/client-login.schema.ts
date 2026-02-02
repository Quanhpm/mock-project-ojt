import { z } from "zod";
import customersData from '@/assets/customer.json';

const customers = customersData.customers;

export const loginSchema = z.object({
    email: z.string().min(1, "Input your email").email("Invalid email format"),
    password: z.string().min(6, "Password required 6 characters"),
}).superRefine((data, ctx) => {
    const customer = customers.find(u => u.email === data.email);

    if (!customer) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email is not registered!",
            path: ["email"],
        });
        return; 
    }

    if (customer.password_hash !== data.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Wrong password!",
            path: ["password"],
        });
    }
});

export type LoginFormValues = z.infer<typeof loginSchema>;