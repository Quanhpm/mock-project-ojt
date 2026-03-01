import { useState } from "react";
import { customerApi } from "../customer.api";
import type { CustomerCreatePayload, Customer } from "../customer.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateCustomer = () => {
  const { error: showErrorToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm thực thi gọi API tạo mới khách hàng
   * @param payload Dữ liệu từ Form nhập vào
   * @param onSuccess Callback chạy khi tạo thành công (vd: Đóng modal, chuyển trang, reset form)
   */
  const createCustomer = async (
    payload: CustomerCreatePayload,
    onSuccess?: (newCustomer: Customer) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      const newCustomer = await customerApi.createCustomer(payload);

      // httpClient tự động throw error nếu thất bại, vào đây = thành công

      // Kích hoạt hành động tiếp theo sau khi thành công
      if (onSuccess) {
        onSuccess(newCustomer);
      }

      return newCustomer; // Trả về data nếu Component bên ngoài muốn dùng trực tiếp
    } catch (err: any) {
      console.error("Lỗi khi tạo khách hàng:", err);

      // Bắt thông báo lỗi từ Backend (ví dụ: "Email đã tồn tại")
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        "Có lỗi xảy ra khi tạo khách hàng mới. Vui lòng thử lại!";
      setError(errorMessage);

      showErrorToast("Tạo mới thất bại", errorMessage);
    } finally {
      // Tắt trạng thái loading dù thành công hay thất bại
      setIsCreating(false);
    }
  };

  return {
    createCustomer,
    isCreating,
    error,
    setError, // Trả ra ngoài để Form có thể tự clear lỗi nếu người dùng bắt đầu gõ lại
  };
};
