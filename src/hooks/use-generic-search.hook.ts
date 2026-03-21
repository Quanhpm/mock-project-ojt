import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast.hook";

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_HISTORY_ITEMS = 5;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Generic search response structure
 */
export interface GenericSearchResponse<T> {
  success: boolean;
  data: T[];
  pageInfo?: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * Generic search payload structure
 */
export interface GenericSearchPayload<F> {
  searchCondition: F;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

/**
 * Generic search filters base interface
 */
export interface BaseSearchFilters {
  keyword: string;
  is_deleted: boolean;
  [key: string]: any; // Allow additional filters
}

/**
 * Options for configuring the generic search hook
 */
export interface UseGenericSearchOptions<T, F extends BaseSearchFilters> {
  /**
   * API function to call for searching
   */
  apiSearchFn: (
    payload: GenericSearchPayload<F>,
  ) => Promise<GenericSearchResponse<T>>;

  /**
   * Default filter values
   */
  defaultFilters: F;

  /**
   * LocalStorage key for saving search history
   */
  storageKey: string;

  /**
   * Function to build search condition from filters
   * This allows customization of how filters are converted to API payload
   */
  buildSearchCondition: (filters: F) => any;

  /**
   * Error message to show when search fails
   */
  errorMessage?: string;

  /**
   * Initial page size (default: 10)
   */
  initialPageSize?: number;

  /**
   * Whether to execute search on mount (default: true)
   */
  executeOnMount?: boolean;
}

/**
 * Return type for the generic search hook
 */
export interface UseGenericSearchReturn<T, F extends BaseSearchFilters> {
  // Data
  data: T[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;

  // Search state
  filters: F;
  setFilters: React.Dispatch<React.SetStateAction<F>>;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;

  // Actions
  executeSearch: () => Promise<void>;
  clearFilters: () => void;
  refetch: () => Promise<void>;

  // Search history
  searchHistory: string[];
  addToHistory: (keyword: string) => void;
  clearHistory: () => void;

  // UI state
  isSearchDropdownOpen: boolean;
  setIsSearchDropdownOpen: (open: boolean) => void;
}

// ============================================================================
// GENERIC SEARCH HOOK
// ============================================================================

/**
 * Generic search hook with pagination, filters, and search history
 *
 * @example
 * ```typescript
 * const userSearch = useGenericSearch<User, UserFilters>({
 *   apiSearchFn: userApi.searchUsers,
 *   defaultFilters: { keyword: "", is_deleted: false },
 *   storageKey: "user_search_history",
 *   buildSearchCondition: (filters) => ({
 *     keyword: filters.keyword,
 *     is_deleted: filters.is_deleted,
 *   }),
 * });
 * ```
 */
export const useGenericSearch = <T, F extends BaseSearchFilters>(
  options: UseGenericSearchOptions<T, F>,
): UseGenericSearchReturn<T, F> => {
  const {
    apiSearchFn,
    defaultFilters,
    storageKey,
    buildSearchCondition,
    errorMessage = "Lỗi tải dữ liệu",
    initialPageSize = 10,
    executeOnMount = true,
  } = options;

  // ──────── State ────────
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const [filters, setFilters] = useState<F>(defaultFilters);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const { error: showError } = useToast();

  // Track if component has mounted (to avoid double fetch on mount)
  const isMounted = useRef(false);
  
  // Track if currently fetching (to prevent concurrent requests)
  const isFetching = useRef(false);

  // ──────── Search History Management ────────

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(`Failed to load search history from ${storageKey}`, e);
    }
  }, [storageKey]);

  // Save search history to localStorage
  const addToHistory = useCallback(
    (keyword: string) => {
      if (!keyword.trim()) return;

      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item !== keyword);
        const newHistory = [keyword, ...filtered].slice(0, MAX_HISTORY_ITEMS);

        try {
          localStorage.setItem(storageKey, JSON.stringify(newHistory));
        } catch (e) {
          console.error(`Failed to save search history to ${storageKey}`, e);
        }

        return newHistory;
      });
    },
    [storageKey],
  );

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error(`Failed to clear search history from ${storageKey}`, e);
    }
  }, [storageKey]);

  // ──────── Search Execution ────────

  // Execute search with current filters and pagination
  const executeSearch = useCallback(async () => {
    // Prevent concurrent requests
    if (isFetching.current) {
      return;
    }
    
    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Build search condition using the provided function
      const searchCondition = buildSearchCondition(filters);

      // Add keyword to history if present
      if (filters.keyword.trim()) {
        addToHistory(filters.keyword.trim());
      }

      // Build payload
      const payload: GenericSearchPayload<any> = {
        searchCondition,
        pageInfo: {
          pageNum: currentPage,
          pageSize: pageSize,
        },
      };

      // Call API
      const response = await apiSearchFn(payload);

      // Handle response
      if (response.success && response.data) {
        setData(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      } else {
        setData([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : errorMessage;
      setError(errMessage);
      showError("Lỗi", errMessage);
      setData([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [
    filters,
    currentPage,
    pageSize,
    buildSearchCondition,
    addToHistory,
    apiSearchFn,
    showError,
    errorMessage,
  ]);

  // Refetch current data (same as executeSearch but more semantic name)
  const refetch = useCallback(async () => {
    await executeSearch();
  }, [executeSearch]);

  // Clear all filters and reset to defaults
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  }, [defaultFilters]);

  // ──────── Effects ────────

  // Execute search on mount if enabled
  useEffect(() => {
    if (executeOnMount) {
      executeSearch();
    }
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-execute search when currentPage or pageSize changes (after mount)
  useEffect(() => {
    if (!isMounted.current) {
      return; // Skip on initial mount
    }
    executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]); // Only depend on pagination values, not the function

  // ──────── Return ────────

  return {
    // Data
    data,
    isLoading,
    error,
    totalPages,
    totalItems,

    // Search state
    filters,
    setFilters,

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,

    // Actions
    executeSearch,
    clearFilters,
    refetch,

    // Search history
    searchHistory,
    addToHistory,
    clearHistory,

    // UI state
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
  };
};
