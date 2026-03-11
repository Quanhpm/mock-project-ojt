import { z } from "zod";

export const editProfileSchema = z.object({
  name: z.string().min(1, "Họ và tên là bắt buộc."),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+\s()\-]{7,15}$/.test(val), {
      message: "Số điện thoại không hợp lệ.",
    }),
  address: z.string().optional(),
  avatar_url: z.string().optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
