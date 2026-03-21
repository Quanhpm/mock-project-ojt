import { useGenericSearch } from "@/hooks";
import { customerApi } from "@/apis";
import type { Customer } from "../../../../types/customer.types";

// ============================================================================
// CUSTOMER SEARCH FILTERS
// ============================================================================

export interface CustomerSearchFilters {
  keyword: string;
  is_active?: string;
  is_deleted: boolean;
}

// ============================================================================
// CUSTOMER SEARCH HOOK
// ============================================================================

/**
 * Hook for searching customers with filters, pagination, and search history
 * Uses the generic search hook with customer-specific configuration
 */
export const useCustomerSearch = () => {
  const defaultFilters: CustomerSearchFilters = {
    keyword: "",
    is_active: "",
    is_deleted: false,
  };

  // Wrapper function to handle API call with correct types
  const searchCustomersWrapper = async (payload: any) => {
    return customerApi.searchCustomers(payload);
  };

  return useGenericSearch<Customer, CustomerSearchFilters>({
    apiSearchFn: searchCustomersWrapper,
    defaultFilters,
    storageKey: "customer_search_history",
    buildSearchCondition: (filters) => {
      const condition: any = {
        is_deleted: filters.is_deleted,
      };

      // Add keyword if present
      if (filters.keyword.trim()) {
        condition.keyword = filters.keyword.trim();
      }

      // Add is_active filter if selected (convert string to boolean)
      if (filters.is_active !== "") {
        condition.is_active = filters.is_active === "true";
      }

      return condition;
    },
    errorMessage: "Lỗi tải dữ liệu khách hàng",
    initialPageSize: 10,
    executeOnMount: true,
  });
};

export type UseCustomerSearchReturn = ReturnType<typeof useCustomerSearch>;
