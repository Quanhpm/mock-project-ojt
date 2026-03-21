import { z } from "zod";

export const franchiseSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên").min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại").regex(/^0\d{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 số"),
  location: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  budget: z.string().min(1, "Vui lòng chọn ngân sách đầu tư"),
  experience: z.string().min(1, "Vui lòng mô tả kinh nghiệm kinh doanh").min(20, "Vui lòng mô tả chi tiết hơn (ít nhất 20 ký tự)"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý với điều khoản dịch vụ",
  }),
});

export type FranchiseFormValues = z.infer<typeof franchiseSchema>;
