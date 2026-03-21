import { useState } from "react";
import { franchiseApi } from "../../../../../apis/endpoints/franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useDeleteFranchise = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  /**
   * Hàm thực thi gọi API xóa nhượng quyền
   * @param id ID của nhượng quyền cần xóa
   * @param onSuccess Callback chạy khi xóa thành công (dùng để đóng Modal và Refresh bảng)
   * @param onError Callback chạy khi xóa thất bại
   */
  const deleteFranchise = async (
    id: number | string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsDeleting(true);
    setError(null);

    try {
      await franchiseApi.deleteFranchise(String(id));

      // httpClient tự động throw error nếu thất bại, vào đây = thành công
      success("Xóa nhượng quyền thành công", "Nhượng quyền đã được xóa.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi xóa nhượng quyền:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Không thể xóa nhượng quyền lúc này. Vui lòng thử lại!";
      setError(errorMessage);

      showErrorToast("Xóa nhượng quyền thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteFranchise,
    isDeleting,
    error,
  };
};
