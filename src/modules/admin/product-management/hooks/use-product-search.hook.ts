import { useState, useEffect, useCallback, useRef } from "react";
import { searchProducts } from "../../../../apis/endpoints/product.api";
import { searchProductFranchises } from "../api/product-franchise.api";
import type {
  ProductTableItem,
} from "../../../../types/product.types";
import { useToast } from "@/hooks/use-toast.hook";
import {
  getFranchiseId,
  getTableScope,
  useAdminAuthStore,
  type TableScope,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";

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
  products: ProductTableItem[];
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
  executeSearch: (nextFilters?: Partial<SearchFilters>) => Promise<void>;
  clearFilters: () => void;

  // Search history
  searchHistory: string[];
  addToHistory: (keyword: string) => void;
  clearHistory: () => void;

  // UI state
  isSearchDropdownOpen: boolean;
  setIsSearchDropdownOpen: (open: boolean) => void;
}

interface UseProductSearchOptions {
  tableScope?: TableScope;
}

export const useProductSearch = (
  options?: UseProductSearchOptions,
): UseProductSearchReturn => {
  const authTableScope = useAdminAuthStore((state) => getTableScope(state));
  const activeFranchiseId = useAdminAuthStore((state) => getFranchiseId(state));
  const tableScope = options?.tableScope ?? authTableScope;

  const [products, setProducts] = useState<ProductTableItem[]>([]);
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
  const previousFranchiseIdRef = useRef<string | null | undefined>(undefined);
  const isInitializedRef = useRef(false);
  const pageChangeInitRef = useRef(false);

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
  const executeSearch = useCallback(async (nextFilters?: Partial<SearchFilters>) => {
    setIsLoading(true);
    setError(null);
    const mergedFilters: SearchFilters = {
      ...filters,
      ...nextFilters,
    };
    const mergedEffectiveFranchiseId =
      tableScope === "FRANCHISE_TABLE_SCOPE"
        ? activeFranchiseId
        : mergedFilters.franchise_id?.trim() || "";

    try {
      if (tableScope === "GLOBAL_TABLE_SCOPE") {
        // Build master-product search condition
        const searchCondition: {
          keyword?: string;
          franchise_id?: string;
          min_price?: number;
          max_price?: number;
          is_active?: boolean;
          is_deleted: boolean;
        } = { is_deleted: mergedFilters.is_deleted };

        if (mergedFilters.keyword.trim()) {
          searchCondition.keyword = mergedFilters.keyword.trim();
          addToHistory(mergedFilters.keyword.trim());
        }
        if (mergedFilters.min_price) searchCondition.min_price = Number(mergedFilters.min_price);
        if (mergedFilters.max_price) searchCondition.max_price = Number(mergedFilters.max_price);
        if (mergedFilters.is_active !== "") searchCondition.is_active = mergedFilters.is_active === "true";
        if (mergedEffectiveFranchiseId) searchCondition.franchise_id = mergedEffectiveFranchiseId;

        const response = await searchProducts({
          searchCondition,
          pageInfo: { pageNum: currentPage, pageSize },
        });

        if (response.success && response.data) {
          setProducts(
            response.data.map((product) => ({
              ...product,
              description: product.description ?? "",
              content: product.content ?? "",
              image_url: product.image_url ?? "",
              images_url: product.images_url ?? [],
              is_have_topping: false,
              tableRowId: product.id,
              masterProductId: product.id,
              displayPrice: product.min_price ?? 0,
              min_price: product.min_price ?? 0,
              max_price: product.max_price ?? 0,
              is_active: product.is_active ?? true,
              is_deleted: product.is_deleted ?? false,
              sourceType: "MASTER_PRODUCT" as const,
            })),
          );
          setTotalPages(response.pageInfo?.totalPages || 0);
          setTotalItems(response.pageInfo?.totalItems || 0);
        } else {
          setProducts([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } else {
        // Franchise-scoped search via product-franchise API
        const response = await searchProductFranchises({
          searchCondition: {
            franchise_id: mergedEffectiveFranchiseId || undefined,
            product_id: undefined,
            size: undefined,
            price_from: mergedFilters.min_price ? Number(mergedFilters.min_price) : undefined,
            price_to: mergedFilters.max_price ? Number(mergedFilters.max_price) : undefined,
            is_active: mergedFilters.is_active !== "" ? mergedFilters.is_active === "true" : undefined,
            is_deleted: mergedFilters.is_deleted,
          },
          pageInfo: { pageNum: currentPage, pageSize },
        });

        const keyword = mergedFilters.keyword.trim().toLowerCase();
        const normalizedProducts: ProductTableItem[] = response.data
          .filter((item) => {
            if (!keyword) return true;
            return [item.product_name, item.product_sku, item.size]
              .filter(Boolean)
              .some((value) => value!.toLowerCase().includes(keyword));
          })
          .map((item) => ({
            id: item.product_id,
            SKU: item.product_sku || "-",
            name: item.product_name || "Unnamed product",
            description: "",
            content: "",
            image_url: "https://placehold.co/80x80?text=Product",
            images_url: [],
            min_price: item.price_base,
            max_price: item.price_base,
            is_active: item.is_active,
            is_deleted: item.is_deleted,
            is_have_topping: false,
            tableRowId: item.id,
            masterProductId: item.product_id,
            displayPrice: item.price_base,
            franchiseName: item.franchise_name,
            sizeLabel: item.size,
            sourceType: "PRODUCT_FRANCHISE" as const,
          }));

        setProducts(normalizedProducts);
        setTotalPages(response.pageInfo?.totalPages || 0);
        setTotalItems(response.pageInfo?.totalItems || normalizedProducts.length);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load products";
      setError(errorMessage);
      showError("Error", errorMessage);
      setProducts([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeFranchiseId,
    addToHistory,
    currentPage,
    filters,
    pageSize,
    showError,
    tableScope,
  ]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      keyword: "",
      franchise_id: tableScope === "GLOBAL_TABLE_SCOPE" ? "" : activeFranchiseId || "",
      min_price: "",
      max_price: "",
      is_active: "",
      is_deleted: false,
    });
    setCurrentPage(1);
  }, [activeFranchiseId, tableScope]);

  // Load initial products on mount (only once)
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      void executeSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when currentPage changes (skip first render)
  useEffect(() => {
    if (!pageChangeInitRef.current) {
      pageChangeInitRef.current = true;
      return;
    }
    void executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (tableScope !== "FRANCHISE_TABLE_SCOPE") {
      previousFranchiseIdRef.current = activeFranchiseId;
      return;
    }

    if (previousFranchiseIdRef.current === undefined) {
      previousFranchiseIdRef.current = activeFranchiseId;
      return;
    }

    if (previousFranchiseIdRef.current !== activeFranchiseId) {
      previousFranchiseIdRef.current = activeFranchiseId;
      setCurrentPage(1);
    }
  }, [activeFranchiseId, tableScope]);

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
