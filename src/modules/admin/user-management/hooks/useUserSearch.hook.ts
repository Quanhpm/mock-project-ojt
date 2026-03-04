import { useGenericSearch } from "@/hooks";
import { userApi } from "../api";
import type { UserItem, UserSearchFilters } from "../api/user.types";

// ============================================================================
// USER SEARCH HOOK
// ============================================================================

/**
 * Hook for searching users with filters, pagination, and search history
 * Uses the generic search hook with user-specific configuration
 */
export const useUserSearch = () => {
  const defaultFilters: UserSearchFilters = {
    keyword: "",
    is_active: "",
    is_deleted: false,
  };

  return useGenericSearch<UserItem, UserSearchFilters>({
    apiSearchFn: userApi.searchUsers,
    defaultFilters,
    storageKey: "user_search_history",
    buildSearchCondition: (filters) => {
      const condition: any = {
        is_deleted: filters.is_deleted,
      };

      // Add keyword if present
      if (filters.keyword.trim()) {
        condition.keyword = filters.keyword.trim();
      }

      // Add is_active filter if selected
      if (filters.is_active !== "") {
        condition.is_active = filters.is_active === "true";
      }

      return condition;
    },
    errorMessage: "Lỗi tải dữ liệu người dùng",
    initialPageSize: 10,
    executeOnMount: true,
  });
};

export type UseUserSearchReturn = ReturnType<typeof useUserSearch>;
