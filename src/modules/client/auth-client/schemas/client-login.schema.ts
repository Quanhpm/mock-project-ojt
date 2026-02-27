import { z } from "zod";
import customers from '@/mockdata/customers.json';



export const loginSchema = z.object({
    email: z.string().min(1, "Vui lòng nhập địa chỉ email").email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
}).superRefine((data, ctx) => {
    const customer = customers.find(u => u.email === data.email);

    if (!customer) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email chưa được đăng ký!",
            path: ["email"],
        });
        return; 
    }

    if (customer.password !== data.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Sai mật khẩu!",
            path: ["password"],
        });
    }
});

export type LoginFormValues = z.infer<typeof loginSchema>;