import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import type { ProductCreatePayload, Product } from "../../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateProduct = () => {
  const { success, error: showErrorToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm thực thi gọi API tạo mới sản phẩm
   * @param payload Dữ liệu từ Form nhập vào
   * @param onSuccess Callback chạy khi tạo thành công (vd: Đóng modal, chuyển trang, reset form)
   */
  const createProductAction = async (
    payload: ProductCreatePayload,
    onSuccess?: (newProduct: Product) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      const newProduct = await productApi.createProduct(payload);

      // httpClient tự động throw error nếu thất bại, vào đây = thành công
      success("Product created", "The product has been created successfully.");

      // Kích hoạt hành động tiếp theo sau khi thành công
      if (onSuccess) {
        onSuccess(newProduct!);
      }

      return newProduct; // Trả về data nếu Component bên ngoài muốn dùng trực tiếp
    } catch (err: any) {
      console.error("Lỗi khi tạo sản phẩm:", err);

      // Bắt thông báo lỗi từ Backend
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        "Unable to create product right now. Please try again.";
      setError(errorMessage);

      showErrorToast("Create failed", errorMessage);
    } finally {
      // Tắt trạng thái loading dù thành công hay thất bại
      setIsCreating(false);
    }
  };

  return {
    createProduct: createProductAction,
    isCreating,
    error,
    setError, // Trả ra ngoài để Form có thể tự clear lỗi nếu người dùng bắt đầu gõ lại
  };
};
