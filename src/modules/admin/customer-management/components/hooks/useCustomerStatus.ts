import { useState } from "react";
import { customerApi, HttpError } from "@/apis";
import { useToast } from "@/hooks/use-toast.hook";

export const useCustomerStatus = () => {
  const { success, error: showErrorToast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleStatus = async (
    id: string,
    currentStatus: boolean,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    setUpdatingId(id);
    const newStatus = !currentStatus;

    try {
      await customerApi.toggleCustomerStatus(id, { is_active: newStatus });
      success(
        "Cập nhật trạng thái thành công",
        `Khách hàng đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"}.`,
      );
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof HttpError
          ? err.message
          : "Không thể thay đổi trạng thái lúc này!";
      showErrorToast("Cập nhật trạng thái thất bại", message);
      onError?.();
    } finally {
      setUpdatingId(null);
    }
  };

  return { toggleStatus, updatingId };
};
