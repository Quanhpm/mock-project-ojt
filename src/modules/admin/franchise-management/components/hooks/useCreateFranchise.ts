import { useState } from "react";
import { franchiseApi } from "../../../../../apis/endpoints/franchise.api";
import type { Franchise } from "../../../../../types/franchise.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateFranchise = () => {
  const { success, error: showErrorToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm thực thi gọi API tạo mới nhượng quyền
   * @param payload Dữ liệu từ Form nhập vào
   * @param onSuccess Callback chạy khi tạo thành công (vd: Đóng modal, chuyển trang, reset form)
   */
  const createFranchiseAction = async (
    payload: Omit<Franchise, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>,
    onSuccess?: (newFranchise: Franchise) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      const newFranchise = await franchiseApi.createFranchise(payload as any);

      // httpClient tự động throw error nếu thất bại, vào đây = thành công
      success("Franchise created successfully", "New franchise has been created.");

      // Kích hoạt hành động tiếp theo sau khi thành công
      if (onSuccess) {
        onSuccess(newFranchise);
      }

      return newFranchise; // Trả về data nếu Component bên ngoài muốn dùng trực tiếp
    } catch (err: any) {
      console.error("Lỗi khi tạo nhượng quyền:", err);

      // Bắt thông báo lỗi từ Backend
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        "An error occurred while creating the franchise. Please try again!";
      setError(errorMessage);

      showErrorToast("Failed to create franchise", errorMessage);
    } finally {
      // Tắt trạng thái loading dù thành công hay thất bại
      setIsCreating(false);
    }
  };

  return {
    createFranchise: createFranchiseAction,
    isCreating,
    error,
    setError, // Trả ra ngoài để Form có thể tự clear lỗi nếu người dùng bắt đầu gõ lại
  };
};
