import { useGenericSearch } from "@/hooks";
import type { GenericSearchPayload, GenericSearchResponse } from "@/hooks";
import { customerApi } from "@/apis";
import type {
  Customer,
  CustomerSearchCondition,
  CustomerSearchPayload,
} from "@/types/customer.types";

export interface CustomerSearchFilters {
  keyword: string;
  is_active?: string;
  is_deleted: boolean;
}

export const useCustomerSearch = () => {
  const defaultFilters: CustomerSearchFilters = {
    keyword: "",
    is_active: "",
    is_deleted: false,
  };

  // buildSearchCondition transforms CustomerSearchFilters → CustomerSearchCondition
  // before the payload is built, so the cast is safe at runtime.
  const searchCustomersWrapper = (
    payload: GenericSearchPayload<CustomerSearchFilters>,
  ): Promise<GenericSearchResponse<Customer>> =>
    customerApi.searchCustomers(payload as unknown as CustomerSearchPayload);

  return useGenericSearch<Customer, CustomerSearchFilters>({
    apiSearchFn: searchCustomersWrapper,
    defaultFilters,
    storageKey: "customer_search_history",
    buildSearchCondition: (filters): CustomerSearchCondition => {
      const condition: CustomerSearchCondition = {
        keyword: filters.keyword.trim(),
        is_deleted: filters.is_deleted,
      };

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
