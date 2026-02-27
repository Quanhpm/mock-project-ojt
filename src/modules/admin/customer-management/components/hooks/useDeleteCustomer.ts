import { useState } from "react";
import { customerApi } from "../customer.api";

export const useDeleteCustomer = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm thực thi gọi API xóa khách hàng
   * @param id ID của khách hàng cần xóa
   * @param onSuccess Callback chạy khi xóa thành công (dùng để đóng Modal và Refresh bảng)
   * @param onError Callback chạy khi xóa thất bại
   */
  const deleteCustomer = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await customerApi.deleteCustomer(id);

      if (response.success) {
        // toast.success("Đã xóa khách hàng thành công!");
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error("Lỗi khi xóa khách hàng:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Không thể xóa khách hàng lúc này. Vui lòng thử lại!";
      setError(errorMessage);

      // toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteCustomer,
    isDeleting,
    error,
  };
};
