import { useCallback } from "react";
import { useGenericSearch } from "@/hooks/use-generic-search.hook";
import { searchCategoryFranchises } from "../api/category-franchise.api";
import { getFranchiseId } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type {
  CategoryFranchise,
  CategoryFranchiseSearchFilters,
  CategoryFranchiseSearchPayload,
} from "../api/category-franchise.types";

const STORAGE_KEY = "category-franchise-search";

export const useCategorySearch = () => {
  const franchiseId = getFranchiseId(useAdminAuthStore.getState());

  const buildSearchCondition = useCallback(
    (filters: CategoryFranchiseSearchFilters) => {
      const searchCondition: CategoryFranchiseSearchPayload["searchCondition"] = {
        is_deleted: false,
      };

      // IMPORTANT: Category Franchise API requires explicit franchise_id
      if (franchiseId) {
        searchCondition.franchise_id = franchiseId;
      }

      if (filters.category_id) {
        searchCondition.category_id = filters.category_id;
      }

      if (filters.is_active !== undefined && filters.is_active !== "") {
        searchCondition.is_active = filters.is_active;
      }

      return searchCondition;
    },
    [franchiseId]
  );

  const apiSearchFn = useCallback(async (payload: CategoryFranchiseSearchPayload) => {
    const response = await searchCategoryFranchises(payload);
    return {
      success: response.success,
      data: response.data,
      pageInfo: response.pageInfo,
    };
  }, []);

  return useGenericSearch<CategoryFranchise, CategoryFranchiseSearchFilters>({
    apiSearchFn,
    defaultFilters: {
      keyword: "",
      is_deleted: false,
      is_active: "",
    } as CategoryFranchiseSearchFilters,
    storageKey: STORAGE_KEY,
    buildSearchCondition,
    executeOnMount: true,
  });
};
