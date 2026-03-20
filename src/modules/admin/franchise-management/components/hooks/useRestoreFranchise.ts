import { useState } from "react";
import { franchiseApi } from "../../../../../apis/endpoints/franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestoreFranchise = () => {
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  /**
   * Hàm thực thi gọi API khôi phục nhượng quyền đã xóa
   * @param id ID của nhượng quyền cần khôi phục
   * @param onSuccess Callback chạy khi khôi phục thành công (dùng để đóng Modal và Refresh bảng)
   * @param onError Callback chạy khi khôi phục thất bại
   */
  const restoreFranchiseAction = async (
    id: number | string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsRestoring(true);
    setError(null);

    try {
      await franchiseApi.restoreFranchise(String(id));

      // httpClient tự động throw error nếu thất bại, vào đây = thành công
      success("Franchise restored successfully", "Franchise has been restored.");
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi khôi phục nhượng quyền:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to restore franchise right now. Please try again!";
      setError(errorMessage);

      showErrorToast("Failed to restore franchise", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    restoreFranchise: restoreFranchiseAction,
    isRestoring,
    error,
  };
};
