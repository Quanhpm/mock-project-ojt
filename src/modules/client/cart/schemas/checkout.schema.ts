import { z } from 'zod';

export const checkoutInfoSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập địa chỉ giao hàng.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .regex(/^[0-9+\s()\-]{9,15}$/, 'Số điện thoại không hợp lệ.'),
  message: z
    .string()
    .trim()
    .max(300, 'Lời nhắn tối đa 300 ký tự.')
    .optional(),
});

export type CheckoutInfoFormValues = z.infer<typeof checkoutInfoSchema>;