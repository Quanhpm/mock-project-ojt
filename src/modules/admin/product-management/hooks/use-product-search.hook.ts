import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  executeSearch: () => Promise<void>;
  clearFilters: () => Promise<void>;

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

const PAGE_PARAM = "page";
const PAGE_SIZE_PARAM = "pageSize";

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const getInitialSearchState = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    currentPage: parsePositiveInt(params.get(PAGE_PARAM), 1),
    pageSize: parsePositiveInt(params.get(PAGE_SIZE_PARAM), 10),
    keyword: params.get("keyword") ?? "",
    franchise_id: params.get("franchise_id") ?? "",
    min_price: params.get("min_price") ?? "",
    max_price: params.get("max_price") ?? "",
    is_active: params.get("is_active") ?? "",
    is_deleted: params.get("is_deleted") === "true",
  };
};

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

  const initialSearchState = useMemo(() => getInitialSearchState(), []);

  const [currentPage, setCurrentPage] = useState(initialSearchState.currentPage);
  const [pageSize, setPageSize] = useState(initialSearchState.pageSize);

  const [filters, setFilters] = useState<SearchFilters>({
    keyword: initialSearchState.keyword,
    franchise_id: initialSearchState.franchise_id,
    min_price: initialSearchState.min_price,
    max_price: initialSearchState.max_price,
    is_active: initialSearchState.is_active,
    is_deleted: initialSearchState.is_deleted,
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
  const runSearch = useCallback(async (searchFilters: SearchFilters, targetPage: number) => {
    setIsLoading(true);
    setError(null);

    const resolvedFranchiseId =
      tableScope === "FRANCHISE_TABLE_SCOPE"
        ? activeFranchiseId
        : searchFilters.franchise_id?.trim() || "";

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
        } = { is_deleted: searchFilters.is_deleted };

        if (searchFilters.keyword.trim()) {
          searchCondition.keyword = searchFilters.keyword.trim();
          addToHistory(searchFilters.keyword.trim());
        }
        if (searchFilters.min_price) searchCondition.min_price = Number(searchFilters.min_price);
        if (searchFilters.max_price) searchCondition.max_price = Number(searchFilters.max_price);
        if (searchFilters.is_active !== "") searchCondition.is_active = searchFilters.is_active === "true";
        if (resolvedFranchiseId) searchCondition.franchise_id = resolvedFranchiseId;

        const response = await searchProducts({
          searchCondition,
          pageInfo: { pageNum: targetPage, pageSize },
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
            franchise_id: resolvedFranchiseId || undefined,
            product_id: undefined,
            size: undefined,
            price_from: searchFilters.min_price ? Number(searchFilters.min_price) : undefined,
            price_to: searchFilters.max_price ? Number(searchFilters.max_price) : undefined,
            is_active: searchFilters.is_active !== "" ? searchFilters.is_active === "true" : undefined,
            is_deleted: searchFilters.is_deleted,
          },
          pageInfo: { pageNum: targetPage, pageSize },
        });

        const keyword = searchFilters.keyword.trim().toLowerCase();
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
    pageSize,
    showError,
    tableScope,
  ]);

  const executeSearch = useCallback(async () => {
    await runSearch(filters, currentPage);
  }, [currentPage, filters, runSearch]);

  // Clear all filters
  const clearFilters = useCallback(async () => {
    const nextFilters: SearchFilters = {
      keyword: "",
      franchise_id: tableScope === "GLOBAL_TABLE_SCOPE" ? "" : activeFranchiseId || "",
      min_price: "",
      max_price: "",
      is_active: "",
      is_deleted: false,
    };

    setFilters(nextFilters);
    setCurrentPage(1);
    await runSearch(nextFilters, 1);
  }, [activeFranchiseId, runSearch, tableScope]);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set(PAGE_PARAM, String(currentPage));
    params.set(PAGE_SIZE_PARAM, String(pageSize));

    if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
    else params.delete("keyword");

    if (filters.franchise_id?.trim()) params.set("franchise_id", filters.franchise_id.trim());
    else params.delete("franchise_id");

    if (filters.min_price?.trim()) params.set("min_price", filters.min_price.trim());
    else params.delete("min_price");

    if (filters.max_price?.trim()) params.set("max_price", filters.max_price.trim());
    else params.delete("max_price");

    if (filters.is_active?.trim()) params.set("is_active", filters.is_active.trim());
    else params.delete("is_active");

    if (filters.is_deleted) params.set("is_deleted", "true");
    else params.delete("is_deleted");

    const nextSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");
    if (nextSearch !== currentSearch) {
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", nextUrl);
    }
  }, [
    currentPage,
    filters.franchise_id,
    filters.is_active,
    filters.is_deleted,
    filters.keyword,
    filters.max_price,
    filters.min_price,
    pageSize,
  ]);

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
