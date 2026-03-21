import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu cũ phải có ít nhất 6 ký tự"),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  }
).refine(
  (data) => data.newPassword !== data.currentPassword,
  {
    message: "Mật khẩu mới phải khác mật khẩu cũ",
    path: ["newPassword"],
  }
);

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;