import { useState, useEffect, useCallback } from "react";
import { franchiseApi } from "../../../../apis/endpoints/franchise.api";
import type { Franchise, FranchiseSearchPayload } from "../../../../types/franchise.types";
import { useToast } from "@/hooks/use-toast.hook";

const SEARCH_HISTORY_KEY = "franchise_search_history";
const MAX_HISTORY_ITEMS = 5;

export interface SearchFilters {
  keyword: string;
  is_active?: boolean | null;
  is_deleted: boolean;
}

export const useFranchiseSearch = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    is_active: null,
    is_deleted: false,
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const { success: showSuccess, error: showError } = useToast();

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load search history", e);
    }
  }, []);

  // Save search history
  const addToHistory = useCallback((keyword: string) => {
    if (!keyword.trim()) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== keyword);
      const newHistory = [keyword, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save search history", e);
      }

      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {
      console.error("Failed to clear search history", e);
    }
  }, []);

  // Execute search
  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchCondition: any = {
        is_deleted: filters.is_deleted,
      };

      if (filters.keyword.trim()) {
        searchCondition.keyword = filters.keyword.trim();
        addToHistory(filters.keyword.trim());
      }

      if (filters.is_active !== null && filters.is_active !== undefined) {
        searchCondition.is_active = filters.is_active;
      }

      const payload: FranchiseSearchPayload = {
        searchCondition,
        pageInfo: {
          pageNum: currentPage,
          pageSize: pageSize,
        },
      };

      const response = await franchiseApi.searchFranchises(payload);

      if (response.success && response.data) {
        setFranchises(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      } else {
        setFranchises([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load franchise data";
      setError(errorMessage);
      showError("Error", errorMessage);
      setFranchises([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize, addToHistory, showError]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      keyword: "",
      is_active: null,
      is_deleted: false,
    });
    setCurrentPage(1);
  }, []);

  // Delete franchise
  const deleteFranchise = useCallback(
    async (id: number | string) => {
      setIsLoading(true);
      try {
        await franchiseApi.deleteFranchise(String(id));
        showSuccess("Success", "Franchise deleted successfully");
        await executeSearch();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete franchise";
        showError("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [executeSearch, showSuccess, showError]
  );

  // Toggle franchise status
  const toggleFranchiseStatus = useCallback(
    async (id: number | string, isActive: boolean) => {
      setIsLoading(true);
      try {
        await franchiseApi.toggleFranchiseStatus(String(id), { is_active: !isActive });
        showSuccess("Success", "Status updated successfully");
        await executeSearch();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update status";
        showError("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [executeSearch, showSuccess, showError]
  );

  // Restore franchise
  const restoreFranchise = useCallback(
    async (id: number | string) => {
      setIsLoading(true);
      try {
        await franchiseApi.restoreFranchise(String(id));
        showSuccess("Success", "Franchise restored successfully");
        await executeSearch();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to restore franchise";
        showError("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [executeSearch, showSuccess, showError]
  );

  // Load initial data on mount
  useEffect(() => {
    executeSearch();
  }, []);

  return {
    franchises,
    isLoading,
    error,
    totalPages,
    totalItems,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    executeSearch,
    clearFilters,
    searchHistory,
    addToHistory,
    clearHistory,
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
    deleteFranchise,
    toggleFranchiseStatus,
    restoreFranchise,
  };
};

export type UseFranchiseSearchReturn = ReturnType<typeof useFranchiseSearch>;

