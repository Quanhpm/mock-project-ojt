import { useState } from "react";
import { customerApi } from "../customer.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useCustomerStatus = () => {
  const { success, error: showErrorToast } = useToast();
  // Lưu lại ID của khách hàng đang bị gọi API đổi trạng thái
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /**
   * @param id ID của khách hàng cần đổi trạng thái
   * @param currentStatus Trạng thái hiện tại của khách hàng (true/false)
   * @param onSuccess Hàm gọi lại khi API thành công (để cập nhật UI)
   * @param onError Hàm gọi lại khi API thất bại (để rollback UI về như cũ)
   */
  const toggleStatus = async (
    id: string,
    currentStatus: boolean,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    // 1. Khóa nút Toggle của đúng khách hàng này
    setUpdatingId(id);

    // 2. Đảo ngược trạng thái để gửi lên Server
    const newStatus = !currentStatus;

    console.log(
      `🔄 Toggling status for customer ${id}: ${currentStatus} → ${newStatus}`,
    );

    try {
      const response = await customerApi.toggleCustomerStatus(id, {
        is_active: newStatus,
      });

      console.log("✅ Toggle status success:", response);

      // Thông báo thành công
      success(
        "Cập nhật trạng thái thành công",
        `Khách hàng đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"}.`,
      );

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Hiển thị thông báo lỗi chi tiết
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thay đổi trạng thái lúc này!";

      showErrorToast("Cập nhật trạng thái thất bại", errorMessage);

      // Nếu API lỗi, phải gọi onError để cái nút Toggle trên UI gạt ngược về chỗ cũ
      if (onError) onError();
    } finally {
      // 3. Mở khóa nút Toggle
      setUpdatingId(null);
    }
  };

  return {
    toggleStatus,
    updatingId,
  };
};
