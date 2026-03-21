import { useCallback, useEffect, useRef } from "react";
import { useGenericSearch } from "@/hooks/use-generic-search.hook";
import { searchCategoryFranchises } from "../api/category-franchise.api";
import {
  getFranchiseId,
  getTableScope,
  type TableScope,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type {
  CategoryFranchise,
  CategoryFranchiseSearchFilters,
  CategoryFranchiseSearchPayload,
} from "../api/category-franchise.types";

const STORAGE_KEY = "category-franchise-search";

interface UseCategorySearchOptions {
  tableScope?: TableScope;
}

export const useCategorySearch = (options?: UseCategorySearchOptions) => {
  const franchiseId = useAdminAuthStore((state) => getFranchiseId(state));
  const authTableScope = useAdminAuthStore((state) => getTableScope(state));
  const tableScope = options?.tableScope ?? authTableScope;

  const buildSearchCondition = useCallback(
    (filters: CategoryFranchiseSearchFilters) => {
      const searchCondition: CategoryFranchiseSearchPayload["searchCondition"] = {
        is_deleted: filters.is_deleted,
      };

      if (tableScope === "FRANCHISE_TABLE_SCOPE" && franchiseId) {
        searchCondition.franchise_id = franchiseId;
      } else if (tableScope === "GLOBAL_TABLE_SCOPE" && filters.franchise_id) {
        searchCondition.franchise_id = filters.franchise_id;
      }

      if (filters.category_id) {
        searchCondition.category_id = filters.category_id;
      }

      if (filters.is_active !== undefined && filters.is_active !== "") {
        searchCondition.is_active = filters.is_active;
      }

      return searchCondition;
    },
    [franchiseId, tableScope]
  );

  const apiSearchFn = useCallback(async (payload: CategoryFranchiseSearchPayload) => {
    const response = await searchCategoryFranchises(payload);
    return {
      success: response.success,
      data: response.data,
      pageInfo: response.pageInfo,
    };
  }, []);

  const search = useGenericSearch<CategoryFranchise, CategoryFranchiseSearchFilters>({
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
  const { refetch, setCurrentPage } = search;

  const previousFranchiseIdRef = useRef<string | null | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // Handle franchise context changes for franchise-scoped users
  useEffect(() => {
    if (tableScope !== "FRANCHISE_TABLE_SCOPE") {
      previousFranchiseIdRef.current = franchiseId;
      return;
    }

    if (previousFranchiseIdRef.current === undefined) {
      previousFranchiseIdRef.current = franchiseId;
      return;
    }

    if (previousFranchiseIdRef.current !== franchiseId) {
      previousFranchiseIdRef.current = franchiseId;
      setCurrentPage(1);
      void refetch();
    }
  }, [franchiseId, refetch, setCurrentPage, tableScope]);

  return search;
};
