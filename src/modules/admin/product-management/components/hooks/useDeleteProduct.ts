import { useState } from "react";
import { deleteProduct as deleteProductAPI } from "../product.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useDeleteProduct = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  /**
   * Hàm thực thi gọi API xóa sản phẩm
   * @param id ID của sản phẩm cần xóa
   * @param onSuccess Callback chạy khi xóa thành công (dùng để đóng Modal và Refresh bảng)
   * @param onError Callback chạy khi xóa thất bại
   */
  const deleteProduct = async (
    id: string,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteProductAPI(id);

      // httpClient tự động throw error nếu thất bại, vào đây = thành công
      success("Xóa sản phẩm thành công", "Sản phẩm đã được xóa.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi xóa sản phẩm:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Không thể xóa sản phẩm lúc này. Vui lòng thử lại!";
      setError(errorMessage);

      showErrorToast("Xóa sản phẩm thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteProduct,
    isDeleting,
    error,
  };
};
