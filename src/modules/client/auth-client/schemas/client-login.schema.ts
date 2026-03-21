import { z } from "zod";

/**
 * Client-side validation for login form
 * Only validates format - actual authentication is done by API
 */
export const loginSchema = z.object({
    email: z.string().min(1, "Vui lòng nhập địa chỉ email").email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;