import { z } from "zod";

/**
 * Client-side validation for registration form
 * Only validates format - actual registration is done by API
 */
export const registerSchema = z.object({
    name: z.string().min(5, "Tên phải có ít nhất 5 ký tự"),
    phone: z.string().min(10, "Nhập đúng định dạng số điện thoại").regex(/^[0-9]+$/, "Số điện thoại không hợp lệ"),
    email: z.string().min(1, "Nhập địa chỉ email").email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Mật khẩu không khớp",
        path: ["confirmPassword"]
    }
);

export type RegisterFormValues = z.infer<typeof registerSchema>;