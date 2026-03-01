import { useState } from "react";
import { customerApi } from "../customer.api";
import type { CustomerUpdatePayload, Customer } from "../customer.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useUpdateCustomer = () => {
  const { error: showErrorToast } = useToast();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm thực thi gọi API cập nhật khách hàng
   * @param id ID của khách hàng đang được sửa
   * @param payload Dữ liệu mới từ Form (KHÔNG chứa password)
   * @param onSuccess Callback chạy khi update thành công (vd: Chuyển về trang list, báo thành công)
   */
  const updateCustomer = async (
    id: string,
    payload: CustomerUpdatePayload,
    onSuccess?: (updatedCustomer: Customer) => void,
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      const updatedCustomer = await customerApi.updateCustomer(id, payload);

      // httpClient tự động throw error nếu thất bại, vào đây = thành công

      if (onSuccess) {
        onSuccess(updatedCustomer);
      }

      return updatedCustomer;
    } catch (err: any) {
      console.error("Lỗi khi cập nhật khách hàng:", err);

      // Bắt thông báo lỗi từ Backend (ví dụ: "Email đã được sử dụng bởi người khác")
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!";
      setError(errorMessage);

      showErrorToast("Cập nhật thất bại", errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateCustomer,
    isUpdating,
    error,
    setError, // Hỗ trợ clear lỗi khi user gõ lại vào form
  };
};
