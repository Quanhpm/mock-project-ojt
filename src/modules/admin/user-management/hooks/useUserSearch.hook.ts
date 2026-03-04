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
  debounceDelay?: number; // Default 500ms
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
  clearSearch: () => void;
}

const SEARCH_HISTORY_KEY = "user_search_history";

/**
 * Custom hook for user search with debounce, pagination, and search history
 * Search fields: username, email, full_name, phone
 *
 * @example
 * ```tsx
 * const {
 *   searchTerm,
 *   setSearchTerm,
 *   results,
 *   isSearching,
 *   searchHistory,
 *   clearSearch
 * } = useUserSearch({
 *   debounceDelay: 500,
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
    debounceDelay = 500,
    enableHistory = true,
    maxHistoryItems = 10,
    initialPageSize = 20,
  } = options;

  const { error: showError } = useToast();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      // Reset to page 1 when search term changes
      if (searchTerm !== debouncedTerm) {
        setCurrentPage(1);
      }
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, debounceDelay]);

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

      const searchKeyword = term ?? debouncedTerm;
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
      debouncedTerm,
      currentPage,
      pageSize,
      filters,
      searchFn,
      addToHistory,
      showError,
    ],
  );

  // Auto search when debounced term or filters change
  useEffect(() => {
    search();
  }, [debouncedTerm, filters, currentPage, pageSize]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedTerm("");
    setCurrentPage(1);
    setResults([]);
    setError(null);
  }, []);

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
    clearSearch,
  };
};
