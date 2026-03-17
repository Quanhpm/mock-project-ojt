import { useState, useCallback } from "react";
import { customerApi, HttpError } from "@/apis";
import type { Customer } from "@/types/customer.types";

export const useGetCustomer = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async (id: string) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await customerApi.getCustomerById(id);
      setCustomer(data);
    } catch (err: unknown) {
      setError(
        err instanceof HttpError
          ? err.message
          : "Có lỗi xảy ra khi tải dữ liệu khách hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { customer, isLoading, error, fetchCustomer };
};
