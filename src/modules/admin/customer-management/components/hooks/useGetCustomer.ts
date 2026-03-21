import { useState, useCallback } from "react";
import { customerApi } from "@/apis";
import type { Customer } from "../../../../../types/customer.types";

export const useGetCustomer = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm gọi API lấy chi tiết khách hàng theo ID
   */
  const fetchCustomer = useCallback(async (id: string) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Vì httpClient đã tự bóc tách data, ta nhận trực tiếp object Customer
      const data = await customerApi.getCustomerById(id);

      // Không cần check response.success nữa
      setCustomer(data);
    } catch (err: any) {
      console.error("Lỗi khi lấy chi tiết khách hàng:", err);
      // httpClient thường ném lỗi ra đây, ta bắt lại
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi tải dữ liệu khách hàng.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    customer,
    isLoading,
    error,
    fetchCustomer,
  };
};
