import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type { User } from "@/apis/endpoints/user.api";

interface SearchCondition {
  keyword?: string;
  role_id?: string;
  is_active?: string | boolean;
  is_deleted?: string | boolean;
}

interface PageInfo {
  pageNum: number;
  pageSize: number;
}

interface UserSearchPayload {
  searchCondition: SearchCondition;
  pageInfo: PageInfo;
}

interface UserSearchResponse {
  success: boolean;
  data: User[];
  pageInfo?: {
    pageNum: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

interface UseUserSearchOptions {
  enableHistory?: boolean; // Default true
  maxHistoryItems?: number; // Default 10
  initialPageSize?: number; // Default 20
}

interface UseUserSearchReturn {
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  results: User[];
  isSearching: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPageSize: (size: number) => void;

  // Search history
  searchHistory: string[];
  clearHistory: () => void;
  removeFromHistory: (term: string) => void;

  // Advanced filters
  filters: Omit<SearchCondition, "keyword">;
  setFilters: (filters: Omit<SearchCondition, "keyword">) => void;

  // Actions
  search: (term?: string, page?: number) => Promise<void>;
  handleManualSearch: () => void; // Manual search trigger
  clearSearch: () => void;
}

const SEARCH_HISTORY_KEY = "user_search_history";

/**
 * Custom hook for user search with manual trigger, pagination, and search history
 * Search fields: username, email, full_name, phone
 * Manual search mode: User must click search button or press Enter
 *
 * @example
 * ```tsx
 * const {
 *   searchTerm,
 *   setSearchTerm,
 *   results,
 *   isSearching,
 *   searchHistory,
 *   handleManualSearch,
 *   clearSearch
 * } = useUserSearch({
 *   enableHistory: true,
 *   initialPageSize: 20
 * });
 * ```
 */
export const useUserSearch = (
  searchFn: (payload: UserSearchPayload) => Promise<UserSearchResponse>,
  options: UseUserSearchOptions = {},
): UseUserSearchReturn => {
  const {
    enableHistory = true,
    maxHistoryItems = 10,
    initialPageSize = 20,
  } = options;

  const { error: showError } = useToast();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTerm, setLastSearchTerm] = useState(""); // Track last searched term

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filters state
  const [filters, setFilters] = useState<Omit<SearchCondition, "keyword">>({
    is_deleted: false,
  });

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (!enableHistory) return [];
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);

  // Save search history to localStorage
  useEffect(() => {
    if (enableHistory && searchHistory.length > 0) {
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
      } catch (err) {
        console.error("Failed to save search history:", err);
      }
    }
  }, [searchHistory, enableHistory]);

  // Add to search history
  const addToHistory = useCallback(
    (term: string) => {
      if (!enableHistory || !term.trim()) return;

      setSearchHistory((prev) => {
        const filtered = prev.filter(
          (item) => item.toLowerCase() !== term.toLowerCase(),
        );
        const newHistory = [term, ...filtered];
        return newHistory.slice(0, maxHistoryItems);
      });
    },
    [enableHistory, maxHistoryItems],
  );

  // Search function
  const search = useCallback(
    async (term?: string, page?: number) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const searchKeyword = term ?? lastSearchTerm;
      const searchPage = page ?? currentPage;

      setIsSearching(true);
      setError(null);

      try {
        const payload: UserSearchPayload = {
          searchCondition: {
            keyword: searchKeyword || undefined,
            ...filters,
          },
          pageInfo: {
            pageNum: searchPage,
            pageSize,
          },
        };

        const response = await searchFn(payload);

        if (response.success) {
          setResults(response.data);
          setTotalPages(response.pageInfo?.totalPages || 0);
          setTotalItems(response.pageInfo?.totalItems || 0);
          setLastSearchTerm(searchKeyword); // Update last search term

          // Add to history only for non-empty searches
          if (searchKeyword.trim()) {
            addToHistory(searchKeyword);
          }
        } else {
          throw new Error("Search failed");
        }
      } catch (err: any) {
        // Ignore abort errors
        if (err.name === "AbortError" || err.message?.includes("aborted")) {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Lỗi khi tìm kiếm user";
        setError(errorMessage);
        showError("Lỗi tìm kiếm", errorMessage);
        setResults([]);
      } finally {
        setIsSearching(false);
        abortControllerRef.current = null;
      }
    },
    [
      lastSearchTerm,
      currentPage,
      pageSize,
      filters,
      searchFn,
      addToHistory,
      showError,
    ],
  );

  // Manual search trigger
  const handleManualSearch = useCallback(() => {
    setLastSearchTerm(searchTerm);
    setCurrentPage(1); // Reset to page 1 on new search
    search(searchTerm, 1);
  }, [searchTerm, search]);

  // Auto search when filters or pagination change (but not search term)
  useEffect(() => {
    // Skip on initial mount - let the initial load effect handle it
    if (isInitialMount.current) {
      return;
    }
    // Always search when filters or pagination changes
    // This ensures role filter and page changes work automatically
    search(lastSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize]);

  // Initial load - search with empty term
  useEffect(() => {
    search("", 1);
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setLastSearchTerm("");
    setCurrentPage(1);
    // Trigger search with empty term
    search("", 1);
  }, [search]);

  // Clear history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (err) {
      console.error("Failed to clear search history:", err);
    }
  }, []);

  // Remove specific item from history
  const removeFromHistory = useCallback((term: string) => {
    setSearchHistory((prev) =>
      prev.filter((item) => item.toLowerCase() !== term.toLowerCase()),
    );
  }, []);

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    error,

    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,

    // Search history
    searchHistory,
    clearHistory,
    removeFromHistory,

    // Filters
    filters,
    setFilters,

    // Actions
    search,
    handleManualSearch,
    clearSearch,
  };
};
