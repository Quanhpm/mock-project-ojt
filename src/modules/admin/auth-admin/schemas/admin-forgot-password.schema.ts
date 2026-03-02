import { z } from "zod";

export const adminForgotPasswordSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export type AdminForgotPasswordFormValues = z.infer<
  typeof adminForgotPasswordSchema
>;
