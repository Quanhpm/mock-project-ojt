import { useState } from "react";
import { restoreProduct } from "../product.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestoreProduct = () => {
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  /**
   * Hàm thực thi gọi API khôi phục sản phẩm đã xóa
   * @param id ID của sản phẩm cần khôi phục
   * @param onSuccess Callback chạy khi khôi phục thành công (dùng để đóng Modal và Refresh bảng)
   * @param onError Callback chạy khi khôi phục thất bại
   */
  const restoreProductAction = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsRestoring(true);
    setError(null);

    try {
      const response = await restoreProduct(id);

      // httpClient tự động throw error nếu thất bại, vào đây = thành công
      success("Khôi phục sản phẩm thành công", "Sản phẩm đã được khôi phục.");
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi khôi phục sản phẩm:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Không thể khôi phục sản phẩm lúc này. Vui lòng thử lại!";
      setError(errorMessage);

      showErrorToast("Khôi phục sản phẩm thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    restoreProduct: restoreProductAction,
    isRestoring,
    error,
  };
};
