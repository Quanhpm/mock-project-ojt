import { useState } from "react";
import { franchiseApi } from "../../../../../apis/endpoints/franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

interface UseToggleFranchiseStatusReturn {
  toggleStatus: (id: number | string, currentStatus: boolean, onSuccess?: () => void, onError?: () => void) => Promise<void>;
  isToggling: boolean;
  error: string | null;
}

export const useToggleFranchiseStatus = (): UseToggleFranchiseStatusReturn => {
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const toggleStatusAction = async (
    id: number | string,
    currentStatus: boolean,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setIsToggling(true);
    setError(null);

    // Đảo ngược trạng thái để gửi lên Server
    const newStatus = !currentStatus;

    console.log(
      `🔄 Toggling status for franchise ${id}: ${currentStatus} → ${newStatus}`
    );

    try {
      const response = await franchiseApi.toggleFranchiseStatus(String(id), {
        is_active: newStatus,
      });

      console.log("✅ Toggle status success:", response);

      // Thông báo thành công
      success(
        "Cập nhật trạng thái thành công",
        `Nhượng quyền đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"}.`
      );

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thay đổi trạng thái lúc này!";

      setError(errorMessage);
      showErrorToast("Cập nhật trạng thái thất bại", errorMessage);

      // Nếu API lỗi, phải gọi onError để rollback UI
      if (onError) onError();
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleStatus: toggleStatusAction, isToggling, error };
};
