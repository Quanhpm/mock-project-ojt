import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  franchiseApi,
  getFranchisesSelect,
  type FranchiseOptionItem,
} from "@/apis/endpoints/franchise.api";
import { useToast } from "@/hooks/use-toast.hook";
import { ROUTER_URL } from "@/routes/router.const";
import {
  createProductFranchise,
  deleteProductFranchise,
  getProductFranchiseById,
  restoreProductFranchise,
  searchProductFranchises,
  updateProductFranchise,
  updateProductFranchiseStatus,
} from "../api/product-franchise.api";
import ProductFranchiseCreateModal from "../components/ProductFranchiseCreateModal";
import ProductFranchiseDeleteModal from "../components/ProductFranchiseDeleteModal";
import ProductFranchiseEditModal from "../components/ProductFranchiseEditModal";
import ProductFranchiseManagementTable from "../components/ProductFranchiseManagementTable";
import ProductFranchiseRestoreModal from "../components/ProductFranchiseRestoreModal";
import ProductFranchiseViewModal from "../components/ProductFranchiseViewModal";
import type {
  ProductFranchiseCreateRequest,
  ProductFranchiseDetail,
  ProductFranchiseLocationState,
  ProductFranchiseSearchItem,
  ProductFranchiseStatusFilterValue,
  ProductFranchiseUpdateRequest,
} from "../types/product-franchise.types";

interface DetailModalState {
  isOpen: boolean;
  item: ProductFranchiseDetail | null;
  sourceItem: ProductFranchiseSearchItem | null;
  isLoading: boolean;
  error: string | null;
}

interface ItemModalState {
  isOpen: boolean;
  item: ProductFranchiseSearchItem | null;
}

const PRODUCT_FRANCHISE_FETCH_PAGE_SIZE = 200;
const PRODUCT_FRANCHISE_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

const formatCount = (count: number) => new Intl.NumberFormat("en-US").format(count);

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const normalizeStatusFilterValue = (
  value: string | null,
): ProductFranchiseStatusFilterValue => {
  if (value === "active" || value === "inactive") {
    return value;
  }

  if (value === "asc") {
    return "active";
  }

  if (value === "desc") {
    return "inactive";
  }

  return "";
};

const buildSearchPayload = (
  franchiseId: string,
  pageNum: number,
  isDeleted: boolean,
) => ({
  searchCondition: {
    product_id: "",
    franchise_id: franchiseId,
    size: "",
    price_from: "",
    price_to: "",
    is_active: "",
    is_deleted: isDeleted,
  },
  pageInfo: {
    pageNum,
    pageSize: PRODUCT_FRANCHISE_FETCH_PAGE_SIZE,
  },
});

const fetchAllProductFranchises = async (
  franchiseId: string,
  isDeleted: boolean,
) => {
  const firstResponse = await searchProductFranchises(
    buildSearchPayload(franchiseId, 1, isDeleted),
  );
  const firstPageItems = firstResponse.data ?? [];
  const totalPages = Math.max(firstResponse.pageInfo?.totalPages ?? 1, 1);

  if (totalPages === 1) {
    return firstPageItems;
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      searchProductFranchises(
        buildSearchPayload(franchiseId, index + 2, isDeleted),
      ),
    ),
  );

  return [
    ...firstPageItems,
    ...remainingResponses.flatMap((response) => response.data ?? []),
  ];
};

const mergeListItem = (
  currentItem: ProductFranchiseSearchItem,
  detail: ProductFranchiseDetail,
  franchiseName?: string,
): ProductFranchiseSearchItem => ({
  ...currentItem,
  ...detail,
  franchise_name: currentItem.franchise_name ?? franchiseName,
});

const buildPaginationPages = (
  currentPage: number,
  totalPages: number,
): Array<number | "..."> => {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "..."> = [];
  const windowStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const windowEnd = windowStart + 2;

  if (windowStart > 2) {
    pages.push(1, "...");
  } else {
    for (let page = 1; page < windowStart; page += 1) {
      pages.push(page);
    }
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push(page);
  }

  if (windowEnd < totalPages - 1) {
    pages.push("...", totalPages);
  } else {
    for (let page = windowEnd + 1; page <= totalPages; page += 1) {
      pages.push(page);
    }
  }

  return pages;
};

export default function ProductFranchisePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { franchiseId: legacyFranchiseId } = useParams<{
    franchiseId?: string;
  }>();
  const locationState =
    (location.state as ProductFranchiseLocationState | null) ?? null;
  const resolvedFranchiseId =
    searchParams.get("franchise_id")?.trim() || legacyFranchiseId || "";

  const { success: showSuccess, error: showError } = useToast();

  const [franchiseName, setFranchiseName] = useState(
    locationState?.franchiseName ?? "",
  );
  const [items, setItems] = useState<ProductFranchiseSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchApplying, setIsSearchApplying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isRestoreSubmitting, setIsRestoreSubmitting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(
    () => searchParams.get("is_deleted") === "true",
  );
  const [currentPage, setCurrentPage] = useState(() =>
    parsePositiveInt(searchParams.get("page"), 1),
  );
  const [pageInput, setPageInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState(
    () => searchParams.get("keyword")?.trim() ?? "",
  );
  const [appliedKeyword, setAppliedKeyword] = useState(
    () => searchParams.get("keyword")?.trim() ?? "",
  );
  const [statusFilter, setStatusFilter] =
    useState<ProductFranchiseStatusFilterValue>(() =>
      normalizeStatusFilterValue(
        searchParams.get("status") ?? searchParams.get("status_sort"),
      ),
    );
  const [franchiseOptions, setFranchiseOptions] = useState<FranchiseOptionItem[]>([]);
  const [isFranchiseOptionsLoading, setIsFranchiseOptionsLoading] = useState(false);
  const [isFranchiseChanging, setIsFranchiseChanging] = useState(false);
  const [navigationLoadingTarget, setNavigationLoadingTarget] = useState<
    "breadcrumb" | "back" | null
  >(null);

  const [viewModal, setViewModal] = useState<DetailModalState>({
    isOpen: false,
    item: null,
    sourceItem: null,
    isLoading: false,
    error: null,
  });
  const [editModal, setEditModal] = useState<DetailModalState>({
    isOpen: false,
    item: null,
    sourceItem: null,
    isLoading: false,
    error: null,
  });
  const [deleteModal, setDeleteModal] = useState<ItemModalState>({
    isOpen: false,
    item: null,
  });
  const [restoreModal, setRestoreModal] = useState<ItemModalState>({
    isOpen: false,
    item: null,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const viewRequestIdRef = useRef(0);
  const editRequestIdRef = useRef(0);
  const hasInitializedSearchRef = useRef(false);

  const backTarget = useMemo(() => {
    if (locationState?.returnTo?.pathname) {
      return `${locationState.returnTo.pathname}${locationState.returnTo.search ?? ""}`;
    }

    return `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.PRODUCT}`;
  }, [locationState?.returnTo?.pathname, locationState?.returnTo?.search]);

  const franchiseSelectOptions = useMemo(() => {
    if (
      resolvedFranchiseId &&
      !franchiseOptions.some((item) => item.value === resolvedFranchiseId)
    ) {
      return [
        {
          value: resolvedFranchiseId,
          code: resolvedFranchiseId,
          name: franchiseName || resolvedFranchiseId,
        },
        ...franchiseOptions,
      ];
    }

    return franchiseOptions;
  }, [franchiseName, franchiseOptions, resolvedFranchiseId]);

  const handleNavigateBack = useCallback(
    (target: "breadcrumb" | "back") => {
      setNavigationLoadingTarget(target);
      navigate(backTarget);
    },
    [backTarget, navigate],
  );

  const navigateToSelectedFranchise = useCallback(
    (franchiseId: string, nextFranchiseName?: string) => {
      if (!franchiseId || franchiseId === resolvedFranchiseId) {
        return;
      }

      setIsFranchiseChanging(true);

      const params = new URLSearchParams({
        franchise_id: franchiseId,
      });

      if (showDeleted) {
        params.set("is_deleted", "true");
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      navigate(
        `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.PRODUCT_FRANCHISE}?${params.toString()}`,
        {
          state: {
            franchiseName: nextFranchiseName,
            returnTo: {
              pathname: locationState?.returnTo?.pathname ?? location.pathname,
              search: locationState?.returnTo?.search ?? location.search,
            },
          },
        },
      );
    },
    [
      location.pathname,
      location.search,
      locationState?.returnTo?.pathname,
      locationState?.returnTo?.search,
      navigate,
      resolvedFranchiseId,
      showDeleted,
      statusFilter,
    ],
  );

  const loadFranchiseProducts = useCallback(async () => {
    if (!resolvedFranchiseId) {
      setItems([]);
      setLoadError("No franchise selected. Please choose one from Product page.");
      setIsFranchiseChanging(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const fetchedItems = await fetchAllProductFranchises(
        resolvedFranchiseId,
        showDeleted,
      );

      setItems(
        fetchedItems.map((item) => ({
          ...item,
          franchise_name: item.franchise_name ?? franchiseName,
        })),
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setItems([]);
      setLoadError(errorMessage);
      showError("Failed to load product franchise list", errorMessage);
    } finally {
      setIsLoading(false);
      setIsFranchiseChanging(false);
    }
  }, [franchiseName, resolvedFranchiseId, showDeleted, showError]);

  useEffect(() => {
    void loadFranchiseProducts();
  }, [loadFranchiseProducts]);

  useEffect(() => {
    let cancelled = false;

    const loadFranchiseOptions = async () => {
      setIsFranchiseOptionsLoading(true);

      try {
        const result = await getFranchisesSelect();

        if (!cancelled) {
          setFranchiseOptions(result ?? []);
        }
      } catch {
        if (!cancelled) {
          setFranchiseOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsFranchiseOptionsLoading(false);
        }
      }
    };

    void loadFranchiseOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (locationState?.franchiseName) {
      setFranchiseName(locationState.franchiseName);
    }
  }, [locationState?.franchiseName]);

  useEffect(() => {
    if (!resolvedFranchiseId || locationState?.franchiseName) {
      return;
    }

    let cancelled = false;

    const loadFranchiseLabel = async () => {
      try {
        const franchise = await franchiseApi.getFranchiseById(resolvedFranchiseId);

        if (!cancelled && franchise?.name) {
          setFranchiseName(franchise.name);
        }
      } catch {
        if (!cancelled) {
          setFranchiseName("");
        }
      }
    };

    void loadFranchiseLabel();

    return () => {
      cancelled = true;
    };
  }, [locationState?.franchiseName, resolvedFranchiseId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setPageInput("");
  }, [resolvedFranchiseId, showDeleted]);

  useEffect(() => {
    if (!hasInitializedSearchRef.current) {
      hasInitializedSearchRef.current = true;
      return;
    }

    setIsSearchApplying(true);

    const timer = window.setTimeout(() => {
      setAppliedKeyword(searchKeyword.trim());
      setCurrentPage(1);
      setPageInput("");
      setIsSearchApplying(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchKeyword]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (resolvedFranchiseId) {
      params.set("franchise_id", resolvedFranchiseId);
    } else {
      params.delete("franchise_id");
    }

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    } else {
      params.delete("page");
    }

    if (searchKeyword.trim()) {
      params.set("keyword", searchKeyword.trim());
    } else {
      params.delete("keyword");
    }

    if (statusFilter) {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
      params.delete("status_sort");
    }

    if (showDeleted) {
      params.set("is_deleted", "true");
    } else {
      params.delete("is_deleted");
    }

    const nextSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");

    if (nextSearch !== currentSearch) {
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [currentPage, resolvedFranchiseId, searchKeyword, showDeleted, statusFilter]);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = appliedKeyword.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus =
        statusFilter === ""
          ? true
          : statusFilter === "active"
            ? item.is_active
            : !item.is_active;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const searchableValues = [
        item.product_name,
        item.product_id,
        item.product_sku,
        item.size,
      ];

      return searchableValues.some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(normalizedKeyword),
      );
    });
  }, [appliedKeyword, items, statusFilter]);

  const totalItems = filteredItems.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / PRODUCT_FRANCHISE_PAGE_SIZE);
  const currentPageDisplay =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const tableIsLoading = isLoading || isSearchApplying;

  const paginatedItems = useMemo(() => {
    if (totalPages === 0) {
      return [];
    }

    const startIndex = (currentPageDisplay - 1) * PRODUCT_FRANCHISE_PAGE_SIZE;

    return filteredItems.slice(
      startIndex,
      startIndex + PRODUCT_FRANCHISE_PAGE_SIZE,
    );
  }, [currentPageDisplay, filteredItems, totalPages]);

  const hasActiveFilters =
    searchKeyword.length > 0 ||
    statusFilter !== "" ||
    showDeleted;

  const selectedFranchiseLabel =
    franchiseName ||
    items[0]?.franchise_name ||
    resolvedFranchiseId ||
    "Selected Franchise";

  const paginationPages = useMemo(
    () => buildPaginationPages(currentPageDisplay, totalPages),
    [currentPageDisplay, totalPages],
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const updateListItem = useCallback(
    (detail: ProductFranchiseDetail) => {
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === detail.id
            ? mergeListItem(currentItem, detail, franchiseName)
            : currentItem,
        ),
      );
    },
    [franchiseName],
  );

  const handleApplySearchNow = useCallback(() => {
    setAppliedKeyword(searchKeyword.trim());
    setCurrentPage(1);
    setPageInput("");
    setIsSearchApplying(false);
  }, [searchKeyword]);

  const handleClearFilters = useCallback(() => {
    setSearchKeyword("");
    setAppliedKeyword("");
    setStatusFilter("");
    setShowDeleted(false);
    setCurrentPage(1);
    setPageInput("");
    setIsSearchApplying(false);
  }, []);

  const handleSearchInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleApplySearchNow();
    }
  };

  const closeViewModal = useCallback(() => {
    viewRequestIdRef.current += 1;
    setViewModal({
      isOpen: false,
      item: null,
      sourceItem: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const closeEditModal = useCallback(() => {
    editRequestIdRef.current += 1;
    setEditModal({
      isOpen: false,
      item: null,
      sourceItem: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const openViewModal = useCallback(
    async (item: ProductFranchiseSearchItem) => {
      if (showDeleted) {
        setViewModal({
          isOpen: true,
          item,
          sourceItem: item,
          isLoading: false,
          error: null,
        });
        return;
      }

      const requestId = viewRequestIdRef.current + 1;
      viewRequestIdRef.current = requestId;

      try {
        const detail = await getProductFranchiseById(item.id);

        if (requestId !== viewRequestIdRef.current) {
          return;
        }

        if (!detail) {
          throw new Error("Product franchise detail not found.");
        }

        setViewModal({
          isOpen: true,
          item: detail,
          sourceItem: item,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (requestId !== viewRequestIdRef.current) {
          return;
        }

        const errorMessage = getErrorMessage(error);
        setViewModal({
          isOpen: true,
          item: null,
          sourceItem: item,
          isLoading: false,
          error: errorMessage,
        });
        showError("Failed to load product franchise detail", errorMessage);
      }
    },
    [showDeleted, showError],
  );

  const openEditModal = useCallback(
    async (item: ProductFranchiseSearchItem) => {
      const requestId = editRequestIdRef.current + 1;
      editRequestIdRef.current = requestId;

      try {
        const detail = await getProductFranchiseById(item.id);

        if (requestId !== editRequestIdRef.current) {
          return;
        }

        if (!detail) {
          throw new Error("Product franchise detail not found.");
        }

        setEditModal({
          isOpen: true,
          item: detail,
          sourceItem: item,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (requestId !== editRequestIdRef.current) {
          return;
        }

        const errorMessage = getErrorMessage(error);
        showError("Failed to load product franchise detail", errorMessage);
      }
    },
    [showError],
  );

  const handleToggleStatus = useCallback(
    async (item: ProductFranchiseSearchItem) => {
      if (statusUpdatingId || showDeleted) {
        return;
      }

      setStatusUpdatingId(item.id);

      try {
        const updated = await updateProductFranchiseStatus(item.id, {
          is_active: !item.is_active,
        });

        setItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  is_active: updated?.is_active ?? !item.is_active,
                  updated_at: updated?.updated_at ?? currentItem.updated_at,
                }
              : currentItem,
          ),
        );

        showSuccess(
          "Status updated",
          `${item.product_name || item.product_id} is now ${
            !item.is_active ? "active" : "inactive"
          }.`,
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        showError("Failed to update status", errorMessage);
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [showDeleted, showError, showSuccess, statusUpdatingId],
  );

  const handleEditSubmit = useCallback(
    async (payload: ProductFranchiseUpdateRequest) => {
      if (!editModal.item) {
        return;
      }

      setIsEditSubmitting(true);

      try {
        const updated = await updateProductFranchise(editModal.item.id, payload);

        if (!updated) {
          throw new Error("Updated product franchise data was not returned.");
        }

        updateListItem(updated);
        showSuccess("Saved", "Product franchise updated successfully.");
        closeEditModal();
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        showError("Failed to update product franchise", errorMessage);
      } finally {
        setIsEditSubmitting(false);
      }
    },
    [closeEditModal, editModal.item, showError, showSuccess, updateListItem],
  );

  const handleCreateSubmit = useCallback(
    async (payload: ProductFranchiseCreateRequest) => {
      setIsCreateSubmitting(true);

      try {
        await createProductFranchise(payload);
        setIsCreateModalOpen(false);
        setCurrentPage(1);
        setPageInput("");

        if (showDeleted) {
          setShowDeleted(false);
        } else {
          await loadFranchiseProducts();
        }

        showSuccess("Created", "Product added to franchise successfully.");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        showError("Failed to create product franchise", errorMessage);
        throw error;
      } finally {
        setIsCreateSubmitting(false);
      }
    },
    [loadFranchiseProducts, showDeleted, showError, showSuccess],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModal.item) {
      return;
    }

    setIsDeleteSubmitting(true);

    try {
      await deleteProductFranchise(deleteModal.item.id);
      setDeleteModal({ isOpen: false, item: null });
      showSuccess("Deleted", "Product franchise deleted successfully.");
      await loadFranchiseProducts();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showError("Failed to delete product franchise", errorMessage);
    } finally {
      setIsDeleteSubmitting(false);
    }
  }, [deleteModal.item, loadFranchiseProducts, showError, showSuccess]);

  const handleRestoreConfirm = useCallback(async () => {
    if (!restoreModal.item) {
      return;
    }

    setIsRestoreSubmitting(true);

    try {
      await restoreProductFranchise(restoreModal.item.id);
      setRestoreModal({ isOpen: false, item: null });
      showSuccess("Restored", "Product franchise restored successfully.");
      await loadFranchiseProducts();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showError("Failed to restore product franchise", errorMessage);
    } finally {
      setIsRestoreSubmitting(false);
    }
  }, [loadFranchiseProducts, restoreModal.item, showError, showSuccess]);

  const activeCountLabel = showDeleted
    ? "Deleted Product Franchise"
    : "Current Product Franchise";

  const paginationSummary =
    totalPages === 0
      ? `Showing page 1 of 1 (${formatCount(totalItems)} product franchises)`
      : `Showing page ${currentPageDisplay} of ${totalPages} (${formatCount(totalItems)} product franchises)`;

  const isSearchLoading = tableIsLoading;
  const isViewModeLoading = isLoading && !isSearchApplying;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-10 flex shrink-0 flex-col gap-6 px-8 py-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Home</span>
            <span>{">"}</span>
            <button
              type="button"
              onClick={() => handleNavigateBack("breadcrumb")}
              disabled={navigationLoadingTarget !== null}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {navigationLoadingTarget === "breadcrumb" ? (
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : null}
              Products
            </button>
            <span>{">"}</span>
            <span className="font-medium text-slate-900">Product Franchise</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleNavigateBack("back")}
                disabled={navigationLoadingTarget !== null}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {navigationLoadingTarget === "back" ? (
                  <svg
                    className="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_back
                  </span>
                )}
                <span>{navigationLoadingTarget === "back" ? "Going back..." : "Back"}</span>
              </button>

              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  Product Franchise Management
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {activeCountLabel}: {tableIsLoading ? "..." : formatCount(totalItems)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="relative">
                <select
                  value={resolvedFranchiseId}
                  onChange={(event) => {
                    const nextFranchiseId = event.target.value;
                    const nextFranchise = franchiseSelectOptions.find(
                      (item) => item.value === nextFranchiseId,
                    );

                    navigateToSelectedFranchise(
                      nextFranchiseId,
                      nextFranchise?.name,
                    );
                  }}
                  disabled={isFranchiseOptionsLoading || isFranchiseChanging}
                  className="min-w-[220px] appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-stone-700 shadow-sm outline-none transition focus:border-[#8B4513] disabled:cursor-not-allowed disabled:opacity-70"
                  title="Choose Franchise"
                >
                  <option value="">Choose Franchise</option>
                  {franchiseSelectOptions.map((franchise) => (
                    <option key={franchise.value} value={franchise.value}>
                      {franchise.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B4513]">
                  {isFranchiseOptionsLoading || isFranchiseChanging ? (
                    <svg
                      className="animate-spin"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">
                      expand_more
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (resolvedFranchiseId) {
                    setIsCreateModalOpen(true);
                  }
                }}
                disabled={
                  navigationLoadingTarget !== null ||
                  isFranchiseChanging ||
                  !resolvedFranchiseId
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#8B4513] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#6d3610] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Create Product</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden px-8 pb-8">
          {!resolvedFranchiseId ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-6 py-6 text-amber-900">
              <h3 className="text-xl font-bold">No franchise selected</h3>
              <p className="mt-3 text-sm leading-6">
                Choose a franchise from the Product page first, then the Product
                Franchise page will load its data automatically.
              </p>
            </div>
          ) : (
            <>
              {loadError ? (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                  <p className="text-sm">{loadError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      void loadFranchiseProducts();
                    }}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : null}
                    {isLoading ? "Retrying..." : "Try again"}
                  </button>
                </div>
              ) : null}

              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex w-full flex-wrap items-center gap-3">
                    <div className="relative min-w-[280px] flex-1">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </div>

                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchKeyword}
                        onChange={(event) => {
                          setSearchKeyword(event.target.value);
                        }}
                        onKeyDown={handleSearchInputKeyDown}
                        placeholder="Search by product name, SKU, or size... (Ctrl+K)"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c6a27f] focus:ring-2 focus:ring-[#c6a27f]"
                      />

                      {searchKeyword ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchKeyword("");
                            setAppliedKeyword("");
                            setCurrentPage(1);
                            setPageInput("");
                            setIsSearchApplying(false);
                          }}
                          className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleApplySearchNow();
                      }}
                      disabled={isSearchLoading}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#8B5A2B] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d4522] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSearchLoading ? (
                        <>
                          <svg
                            className="animate-spin"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                          Search
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(
                          event.target.value as ProductFranchiseStatusFilterValue,
                        );
                        setCurrentPage(1);
                        setPageInput("");
                      }}
                      className="h-11 min-w-[160px] rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#8B4513]"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleted(!showDeleted);
                      }}
                      disabled={isViewModeLoading || isFranchiseChanging}
                      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                        showDeleted
                          ? "border-amber-200 bg-amber-50 text-orange-500"
                          : "border-slate-300 bg-white text-slate-500"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      {isViewModeLoading ? (
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">
                          delete_outline
                        </span>
                      )}
                      {showDeleted ? "Deleted" : "Current"}
                    </button>

                    <button
                      type="button"
                      onClick={handleClearFilters}
                      disabled={isSearchLoading || isFranchiseChanging}
                      className="h-9 rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <ProductFranchiseManagementTable
                  items={paginatedItems}
                  isLoading={tableIsLoading}
                  isDeletedView={showDeleted}
                  statusUpdatingId={statusUpdatingId}
                  actionsDisabled={isFranchiseChanging}
                  appliedKeyword={appliedKeyword}
                  hasActiveFilters={hasActiveFilters}
                  onToggleStatus={handleToggleStatus}
                  onView={(item) => {
                    void openViewModal(item);
                  }}
                  onEdit={(item) => {
                    void openEditModal(item);
                  }}
                  onDelete={(item) => {
                    setDeleteModal({ isOpen: true, item });
                  }}
                  onRestore={(item) => {
                    setRestoreModal({ isOpen: true, item });
                  }}
                  onClearFilters={handleClearFilters}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <p className="text-sm text-slate-600">{paginationSummary}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <nav aria-label="Pagination" className="inline-flex">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPageDisplay - 1))
                      }
                      disabled={currentPageDisplay <= 1 || totalPages === 0}
                      className="rounded-l-lg border border-slate-200 border-r-0 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      Previous
                    </button>

                    {paginationPages.length > 0 ? (
                      paginationPages.map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="inline-flex items-center px-1 text-sm text-slate-500"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-10 border border-r-0 px-3 py-2 text-sm font-medium transition ${
                              currentPageDisplay === page
                                ? "border-[#8B4513] bg-[#8B4513] text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="min-w-10 border border-[#8B4513] border-r-0 bg-[#8B4513] px-3 py-2 text-sm font-semibold text-white"
                      >
                        1
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPageDisplay + 1))
                      }
                      disabled={currentPageDisplay >= totalPages || totalPages === 0}
                      className="rounded-r-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      Next
                    </button>
                  </nav>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Go to</span>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(totalPages, 1)}
                      value={pageInput}
                      onChange={(event) => setPageInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          const nextPage = parseInt(pageInput, 10);

                          if (
                            !Number.isNaN(nextPage) &&
                            nextPage >= 1 &&
                            nextPage <= Math.max(totalPages, 1)
                          ) {
                            setCurrentPage(nextPage);
                          }

                          setPageInput("");
                        }
                      }}
                      placeholder={String(currentPageDisplay)}
                      className="h-9 w-14 rounded-lg border border-slate-200 px-2 text-center text-sm outline-none focus:border-[#8B4513]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <ProductFranchiseViewModal
        isOpen={viewModal.isOpen}
        onClose={closeViewModal}
        item={viewModal.item}
        productName={
          viewModal.sourceItem?.product_name || viewModal.sourceItem?.product_id
        }
        franchiseName={
          viewModal.sourceItem?.franchise_name || selectedFranchiseLabel
        }
        isLoading={viewModal.isLoading}
        error={viewModal.error}
      />

      <ProductFranchiseCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!isCreateSubmitting) {
            setIsCreateModalOpen(false);
          }
        }}
        onSubmit={handleCreateSubmit}
        franchiseId={resolvedFranchiseId}
        franchiseName={selectedFranchiseLabel}
        isSubmitting={isCreateSubmitting}
      />

      <ProductFranchiseEditModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        item={editModal.item}
        productName={
          editModal.sourceItem?.product_name || editModal.sourceItem?.product_id
        }
        isLoading={editModal.isLoading}
        isSubmitting={isEditSubmitting}
        onSubmit={handleEditSubmit}
      />

      <ProductFranchiseDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          if (!isDeleteSubmitting) {
            setDeleteModal({ isOpen: false, item: null });
          }
        }}
        onConfirm={handleDeleteConfirm}
        item={deleteModal.item}
        isSubmitting={isDeleteSubmitting}
      />

      <ProductFranchiseRestoreModal
        isOpen={restoreModal.isOpen}
        onClose={() => {
          if (!isRestoreSubmitting) {
            setRestoreModal({ isOpen: false, item: null });
          }
        }}
        onConfirm={handleRestoreConfirm}
        item={restoreModal.item}
        isSubmitting={isRestoreSubmitting}
      />
    </div>
  );
}
