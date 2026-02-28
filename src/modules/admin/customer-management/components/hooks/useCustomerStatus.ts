import { useState } from "react";
import { customerApi } from "../customer.api";

// export { toast } from "react-toastify"; // Mở ra nếu bạn dùng thư viện thông báo

export const useCustomerStatus = () => {
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

    try {
      await customerApi.toggleCustomerStatus(id, {
        is_active: newStatus,
      });

      // httpClient tự động throw error nếu thất bại, vào đây = thành công
      // toast.success(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} khách hàng!`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Lỗi cập nhật trạng thái:", err);
      // toast.error("Không thể thay đổi trạng thái lúc này!");

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
