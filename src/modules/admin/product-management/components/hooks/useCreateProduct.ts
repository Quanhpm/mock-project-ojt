import { useState } from "react";
import { productApi } from "../../../../../apis/endpoints/product.api";
import type { ProductCreatePayload, Product } from "../../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateProduct = () => {
  const { success, error: showErrorToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Executes create-product API and triggers optional success callback.
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
      console.error("Create product failed:", err);

      // Bắt thông báo lỗi từ Backend
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        "An error occurred while creating the product. Please try again.";
      setError(errorMessage);

      showErrorToast("Create failed", errorMessage);
    } finally {
      // Always clear loading state.
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
