import { useState, useCallback } from "react";
import { customerApi, HttpError } from "@/apis";
import type {
  Customer,
  CustomerSearchPayload,
  PageInfoResponse,
} from "@/types/customer.types";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pageData, setPageData] = useState<PageInfoResponse>({
    pageNum: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (payload: CustomerSearchPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await customerApi.searchCustomers(payload);
      setCustomers(response.data);
      setPageData(response.pageInfo);
    } catch (err: unknown) {
      setError(
        err instanceof HttpError
          ? err.message
          : "Không thể tải danh sách khách hàng. Vui lòng thử lại!",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { customers, pageData, isLoading, error, fetchCustomers };
};
