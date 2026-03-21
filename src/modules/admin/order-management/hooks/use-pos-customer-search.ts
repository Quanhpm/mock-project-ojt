import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type { CustomerOption } from "../models/customer.models";
import type { SearchCustomersRequest } from "../models/request.models";
import { customerService } from "../services/customer.service";

export const usePosCustomerSearch = (customerKeyword: string) => {
  const { error: showError } = useToast();
  const [customerResults, setCustomerResults] = useState<CustomerOption[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  const searchCustomers = useCallback(async () => {
    const keyword = customerKeyword.trim();

    if (keyword.length < 2) {
      setCustomerResults([]);
      return;
    }

    const payload: SearchCustomersRequest = {
      searchCondition: {
        keyword,
        is_active: true,
        is_deleted: false,
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 10,
      },
    };

    try {
      setIsSearchingCustomers(true);
      const response = await customerService.searchCustomers(payload);
      setCustomerResults(response.data ?? []);
    } catch (error) {
      console.error("[OrderPOS] Failed to search customers", error);
      showError("Không tìm được khách hàng");
      setCustomerResults([]);
    } finally {
      setIsSearchingCustomers(false);
    }
  }, [customerKeyword, showError]);

  const clearCustomerResults = useCallback(() => {
    setCustomerResults([]);
  }, []);

  return {
    customerResults,
    isSearchingCustomers,
    searchCustomers,
    clearCustomerResults,
  };
};
