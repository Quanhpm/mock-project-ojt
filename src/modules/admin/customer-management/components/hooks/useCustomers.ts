import { useState, useCallback } from "react";
import { customerApi } from "../customer.api";
import type {
  Customer,
  CustomerSearchPayload,
  PageInfoResponse,
} from "../customer.types";

export const useCustomers = () => {
  // 1. Khởi tạo các State để quản lý dữ liệu và trạng thái UI
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pageData, setPageData] = useState<PageInfoResponse>({
    pageNum: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Hàm gọi API được bọc trong useCallback để tránh re-render không cần thiết
  const fetchCustomers = useCallback(async (payload: CustomerSearchPayload) => {
    setIsLoading(true);
    setError(null); // Reset lỗi mỗi lần gọi lại API

    try {
      const response = await customerApi.searchCustomers(payload);

      // Backend trả về mảng dữ liệu nằm trong response.data và thông tin trang trong response.pageInfo
      setCustomers(response.data);
      setPageData(response.pageInfo);
    } catch (err: any) {
      console.error("Lỗi fetch khách hàng:", err);
      // Xử lý thông báo lỗi (có thể tuỳ chỉnh theo cấu trúc lỗi backend trả về)
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách khách hàng. Vui lòng thử lại!",
      );
    } finally {
      // Dù thành công hay thất bại cũng phải tắt trạng thái loading
      setIsLoading(false);
    }
  }, []);

  // 3. Trả về những data và function cần thiết cho Component sử dụng
  return {
    customers,
    pageData,
    isLoading,
    error,
    fetchCustomers,
  };
};
