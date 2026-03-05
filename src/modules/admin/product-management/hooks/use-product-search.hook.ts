import { useState, useEffect, useCallback } from "react";
import { searchProducts } from "../components/product.api";
import type {
  Product,
  ProductSearchPayload,
} from "../components/product.types";
import { useToast } from "@/hooks/use-toast.hook";

// Search history stored in localStorage
const SEARCH_HISTORY_KEY = "product_search_history";
const MAX_HISTORY_ITEMS = 5;

interface SearchFilters {
  keyword: string;
  franchise_id?: string;
  min_price?: string;
  max_price?: string;
  is_active?: string;
  is_deleted: boolean;
}

interface UseProductSearchReturn {
  // Data
  products: Product[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;

  // Search state
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;

  // Actions
  executeSearch: () => Promise<void>;
  clearFilters: () => void;

  // Search history
  searchHistory: string[];
  addToHistory: (keyword: string) => void;
  clearHistory: () => void;

  // UI state
  isSearchDropdownOpen: boolean;
  setIsSearchDropdownOpen: (open: boolean) => void;
}

export const useProductSearch = (): UseProductSearchReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    franchise_id: "",
    min_price: "",
    max_price: "",
    is_active: "",
    is_deleted: false,
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const { error: showError } = useToast();

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

  // Save search history to localStorage
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
      // Build search payload
      const searchCondition: any = {
        is_deleted: filters.is_deleted,
      };

      if (filters.keyword.trim()) {
        searchCondition.keyword = filters.keyword.trim();
        addToHistory(filters.keyword.trim());
      }

      if (filters.franchise_id) {
        searchCondition.franchise_id = filters.franchise_id;
      }

      if (filters.min_price) {
        searchCondition.min_price = Number(filters.min_price);
      }

      if (filters.max_price) {
        searchCondition.max_price = Number(filters.max_price);
      }

      if (filters.is_active !== "") {
        searchCondition.is_active = filters.is_active === "true";
      }

      const payload: ProductSearchPayload = {
        searchCondition,
        pageInfo: {
          pageNum: currentPage,
          pageSize: pageSize,
        },
      };

      const response = await searchProducts(payload);

      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || 0);
      } else {
        setProducts([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải dữ liệu sản phẩm";
      setError(errorMessage);
      showError("Lỗi", errorMessage);
      setProducts([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize, addToHistory, showError]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      keyword: "",
      franchise_id: "",
      min_price: "",
      max_price: "",
      is_active: "",
      is_deleted: false,
    });
    setCurrentPage(1);
  }, []);

  // Load initial products on mount
  useEffect(() => {
    executeSearch();
  }, []);

  return {
    // Data
    products,
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

    // Search history
    searchHistory,
    addToHistory,
    clearHistory,

    // UI state
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
  };
};
