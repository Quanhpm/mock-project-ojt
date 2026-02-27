import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  }
);

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;