import { useState } from "react";
import { changeUserStatus } from "@/apis/endpoints/user.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useUserStatus = () => {
  const { success, error: showErrorToast } = useToast();
  // Lưu lại ID của user đang bị gọi API đổi trạng thái
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /**
   * @param id ID của user cần đổi trạng thái
   * @param currentStatus Trạng thái hiện tại của user (true/false)
   * @param onSuccess Hàm gọi lại khi API thành công (để cập nhật UI)
   * @param onError Hàm gọi lại khi API thất bại (để rollback UI về như cũ)
   */
  const toggleStatus = async (
    id: string,
    currentStatus: boolean,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    // 1. Khóa nút Toggle của đúng user này
    setUpdatingId(id);

    // 2. Đảo ngược trạng thái để gửi lên Server
    const newStatus = !currentStatus;

    console.log(
      `🔄 Toggling status for user ${id}: ${currentStatus} → ${newStatus}`,
    );

    try {
      await changeUserStatus(id, {
        is_active: newStatus,
      });

      console.log("✅ Toggle status success");

      success(
        "Status updated successfully",
        `User has been ${newStatus ? "activated" : "deactivated"}.`,
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
        "Cannot change status right now!";

      showErrorToast("Failed to update status", errorMessage);

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
