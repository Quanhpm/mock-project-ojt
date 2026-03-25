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

const formatCount = (count: number) =>
  new Intl.NumberFormat("en-US").format(count);

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

  const pages: Array<number | "..."> = [];

  if (totalPages <= 5) {
    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }

    return pages;
  }

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

  const handleCreateProductClick = useCallback(() => {
    if (!resolvedFranchiseId) {
      return;
    }

    setIsCreateModalOpen(true);
  }, [resolvedFranchiseId]);

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

      const searchableValues = [item.product_name, item.product_id, item.size];

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

    const startIndex =
      (currentPageDisplay - 1) * PRODUCT_FRANCHISE_PAGE_SIZE;

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
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <header
          style={{
            width: "100%",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#6c757d",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#6c757d" }}>Home</span>
              <span style={{ fontSize: "16px" }}>{">"}</span>
              <button
                type="button"
                onClick={() => handleNavigateBack("breadcrumb")}
                disabled={navigationLoadingTarget !== null}
                style={{
                  color: "#6c757d",
                  textDecoration: "none",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: navigationLoadingTarget !== null ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: navigationLoadingTarget !== null ? 0.7 : 1,
                }}
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
              <span style={{ fontSize: "16px" }}>{">"}</span>
              <span style={{ color: "#212529", fontWeight: "500" }}>
                Product Franchise
              </span>
            </nav>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={() => handleNavigateBack("back")}
                disabled={navigationLoadingTarget !== null}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "fit-content",
                  backgroundColor: "#ffffff",
                  color: "#6b4f3a",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "1px solid #d6d3d1",
                  transition: "all 0.2s",
                  cursor: navigationLoadingTarget !== null ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  opacity: navigationLoadingTarget !== null ? 0.7 : 1,
                }}
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
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    arrow_back
                  </span>
                )}
                <span>{navigationLoadingTarget === "back" ? "Going back..." : "Back"}</span>
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h2
                  style={{
                    fontSize: "32px",
                    fontWeight: "900",
                    letterSpacing: "-0.025em",
                    color: "#212529",
                    margin: 0,
                  }}
                >
                  Product Franchise Management
                </h2>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  {activeCountLabel}: {tableIsLoading ? "..." : formatCount(totalItems)}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ position: "relative" }}>
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
                  style={{
                    minWidth: "220px",
                    height: "44px",
                    padding: "0 40px 0 16px",
                    borderRadius: "10px",
                    border: "1px solid #d6d3d1",
                    backgroundColor: "#ffffff",
                    color: "#44403c",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor:
                      isFranchiseOptionsLoading || isFranchiseChanging
                        ? "not-allowed"
                        : "pointer",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                    opacity:
                      isFranchiseOptionsLoading || isFranchiseChanging ? 0.75 : 1,
                    appearance: "none",
                  }}
                  title="Choose Franchise"
                >
                  {franchiseSelectOptions.map((franchise) => (
                    <option key={franchise.value} value={franchise.value}>
                      {franchise.name}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#8B4513",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      expand_more
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateProductClick}
                disabled={
                  navigationLoadingTarget !== null ||
                  isFranchiseChanging ||
                  !resolvedFranchiseId
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#8B4513",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 2px rgba(139, 69, 19, 0.2)",
                  transition: "all 0.2s",
                  cursor:
                    navigationLoadingTarget !== null ||
                    isFranchiseChanging ||
                    !resolvedFranchiseId
                      ? "not-allowed"
                      : "pointer",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "14px",
                  opacity:
                    navigationLoadingTarget !== null ||
                    isFranchiseChanging ||
                    !resolvedFranchiseId
                      ? 0.7
                      : 1,
                }}
                onMouseEnter={(event) => {
                  if (
                    !navigationLoadingTarget &&
                    !isFranchiseChanging &&
                    resolvedFranchiseId
                  ) {
                    event.currentTarget.style.backgroundColor = "#6d3610";
                  }
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = "#8B4513";
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  add
                </span>
                <span>Create Product</span>
              </button>
            </div>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "0 32px 32px",
            overflow: "hidden",
          }}
        >
          {!resolvedFranchiseId ? (
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #fcd34d",
                backgroundColor: "#fffbeb",
                padding: "24px",
                color: "#92400e",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
                No franchise selected
              </h3>
              <p style={{ margin: "12px 0 0", lineHeight: 1.6 }}>
                Choose a franchise from the Product page first, then the Product
                Franchise page will load its data automatically.
              </p>
            </div>
          ) : (
            <>
              {loadError ? (
                <div
                  style={{
                    borderRadius: "14px",
                    border: "1px solid #fecaca",
                    backgroundColor: "#fef2f2",
                    padding: "16px 20px",
                    color: "#b91c1c",
                    marginBottom: "24px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <p style={{ margin: 0 }}>{loadError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        void loadFranchiseProducts();
                      }}
                      disabled={isLoading}
                      style={{
                        height: "36px",
                        padding: "0 14px",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        backgroundColor: "#ffffff",
                        color: "#b91c1c",
                        fontWeight: 600,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        opacity: isLoading ? 0.7 : 1,
                      }}
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
                </div>
              ) : null}

              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  marginBottom: "24px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      width: "100%",
                    }}
                  >
                    <div style={{ flex: "1 1 480px", minWidth: "280px", position: "relative" }}>
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "12px",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#9ca3af",
                          }}
                        >
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
                          placeholder="Search by product name or size... (Ctrl+K)"
                          className="focus:outline-none focus:ring-2 focus:ring-[#c6a27f] focus:border-transparent transition-all duration-200 placeholder-gray-400"
                          style={{
                            display: "block",
                            width: "100%",
                            height: "42px",
                            borderRadius: "10px",
                            border: "1px solid #e5e7eb",
                            padding: "0 40px 0 40px",
                            color: "#212529",
                            backgroundColor: "#ffffff",
                            fontSize: "13px",
                            boxSizing: "border-box",
                          }}
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
                            style={{
                              position: "absolute",
                              top: "50%",
                              right: "12px",
                              transform: "translateY(-50%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "20px",
                              height: "20px",
                              border: "none",
                              borderRadius: "999px",
                              backgroundColor: "#f1f5f9",
                              color: "#64748b",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(event) => {
                              event.currentTarget.style.backgroundColor = "#e2e8f0";
                              event.currentTarget.style.color = "#334155";
                            }}
                            onMouseLeave={(event) => {
                              event.currentTarget.style.backgroundColor = "#f1f5f9";
                              event.currentTarget.style.color = "#64748b";
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void handleApplySearchNow();
                      }}
                      disabled={isSearchLoading}
                      style={{
                        height: "42px",
                        padding: "0 14px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: "#8B5A2B",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: isSearchLoading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        opacity: isSearchLoading ? 0.6 : 1,
                        boxShadow: "0 1px 2px rgba(139, 90, 43, 0.2)",
                      }}
                      onMouseEnter={(event) => {
                        if (!isSearchLoading) {
                          event.currentTarget.style.backgroundColor = "#6d4522";
                        }
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor = "#8B5A2B";
                      }}
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

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      value={statusFilter || "__placeholder__"}
                      onChange={(event) => {
                        setStatusFilter(
                          event.target.value as ProductFranchiseStatusFilterValue,
                        );
                        setCurrentPage(1);
                        setPageInput("");
                      }}
                      style={{
                        height: "42px",
                        padding: "0 16px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#374151",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        outline: "none",
                        transition: "all 0.2s",
                        minWidth: "160px",
                      }}
                      onMouseEnter={(event) =>
                        (event.currentTarget.style.borderColor = "#bdbdbd")
                      }
                      onMouseLeave={(event) =>
                        (event.currentTarget.style.borderColor = "#d1d5db")
                      }
                    >
                      <option value="__placeholder__" hidden>
                        Status
                      </option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleted(!showDeleted);
                      }}
                      disabled={isViewModeLoading || isFranchiseChanging}
                      style={{
                        height: "36px",
                        padding: "0 14px",
                        borderRadius: "8px",
                        border: `1px solid ${showDeleted ? "#f2d1a1" : "#d1d5db"}`,
                        backgroundColor: showDeleted ? "#fbf2e3" : "#ffffff",
                        color: showDeleted ? "#f97316" : "#64748b",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor:
                          isViewModeLoading || isFranchiseChanging
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "112px",
                        boxShadow: showDeleted
                          ? "0 1px 2px rgba(249, 115, 22, 0.08)"
                          : "none",
                        opacity:
                          isViewModeLoading || isFranchiseChanging ? 0.7 : 1,
                      }}
                      onMouseEnter={(event) => {
                        if (!isViewModeLoading && !isFranchiseChanging) {
                          event.currentTarget.style.borderColor = showDeleted
                            ? "#edc58f"
                            : "#cbd5e1";
                          event.currentTarget.style.backgroundColor = showDeleted
                            ? "#faebd7"
                            : "#f8fafc";
                          event.currentTarget.style.color = showDeleted
                            ? "#ea580c"
                            : "#475569";
                        }
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.borderColor = showDeleted
                          ? "#f2d1a1"
                          : "#d1d5db";
                        event.currentTarget.style.backgroundColor = showDeleted
                          ? "#fbf2e3"
                          : "#ffffff";
                        event.currentTarget.style.color = showDeleted
                          ? "#f97316"
                          : "#64748b";
                      }}
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
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          delete_outline
                        </span>
                      )}
                      {showDeleted ? "Deleted" : "Current"}
                    </button>

                    <button
                      type="button"
                      onClick={handleClearFilters}
                      disabled={isSearchLoading || isFranchiseChanging}
                      style={{
                        height: "36px",
                        padding: "0 14px",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#f3f4f6",
                        color: "#334155",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor:
                          isSearchLoading || isFranchiseChanging
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        width: "100px",
                        opacity:
                          isSearchLoading || isFranchiseChanging ? 0.7 : 1,
                      }}
                      onMouseEnter={(event) => {
                        if (!isSearchLoading && !isFranchiseChanging) {
                          event.currentTarget.style.color = "#1f2937";
                          event.currentTarget.style.borderColor = "#d1d5db";
                          event.currentTarget.style.backgroundColor = "#e5e7eb";
                        }
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.color = "#334155";
                        event.currentTarget.style.borderColor = "#e5e7eb";
                        event.currentTarget.style.backgroundColor = "#f3f4f6";
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                <ProductFranchiseManagementTable
                  items={paginatedItems}
                  isLoading={tableIsLoading}
                  isDeletedView={showDeleted}
                  statusUpdatingId={statusUpdatingId}
                  actionLoadingKey={null}
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

              <div
                style={{
                  marginTop: "16px",
                  borderTop: "1px solid #e9ecef",
                  backgroundColor: "#f8f9fa",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  flexShrink: 0,
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>
                    {paginationSummary}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <nav aria-label="Pagination" style={{ display: "inline-flex" }}>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPageDisplay - 1))
                      }
                      disabled={currentPageDisplay <= 1 || totalPages === 0}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color:
                          currentPageDisplay <= 1 || totalPages === 0
                            ? "#9ca3af"
                            : "#374151",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderTopLeftRadius: "6px",
                        borderBottomLeftRadius: "6px",
                        borderRight: "none",
                        cursor:
                          currentPageDisplay <= 1 || totalPages === 0
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(event) => {
                        if (currentPageDisplay > 1 && totalPages > 0) {
                          event.currentTarget.style.backgroundColor = "#f9fafb";
                          event.currentTarget.style.borderColor = "#d1d5db";
                        }
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor = "white";
                        event.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      Previous
                    </button>

                    {paginationPages.length > 0 ? (
                      paginationPages.map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "0 4px",
                              fontSize: "14px",
                              color: "#6b7280",
                            }}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "40px",
                              padding: "8px 12px",
                              fontSize: "14px",
                              fontWeight:
                                currentPageDisplay === page ? "600" : "500",
                              color:
                                currentPageDisplay === page ? "white" : "#374151",
                              backgroundColor:
                                currentPageDisplay === page ? "#8B4513" : "white",
                              border: "1px solid",
                              borderColor:
                                currentPageDisplay === page ? "#8B4513" : "#e5e7eb",
                              borderRight: "none",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(event) => {
                              if (currentPageDisplay !== page) {
                                event.currentTarget.style.backgroundColor = "#f9fafb";
                                event.currentTarget.style.borderColor = "#d1d5db";
                              }
                            }}
                            onMouseLeave={(event) => {
                              if (currentPageDisplay !== page) {
                                event.currentTarget.style.backgroundColor = "white";
                                event.currentTarget.style.borderColor = "#e5e7eb";
                              } else {
                                event.currentTarget.style.backgroundColor = "#8B4513";
                                event.currentTarget.style.borderColor = "#8B4513";
                              }
                            }}
                          >
                            {page}
                          </button>
                        ),
                      )
                    ) : (
                      <button
                        type="button"
                        disabled
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "40px",
                          padding: "8px 12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "white",
                          backgroundColor: "#8B4513",
                          border: "1px solid #8B4513",
                          borderRight: "none",
                        }}
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
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color:
                          currentPageDisplay >= totalPages || totalPages === 0
                            ? "#9ca3af"
                            : "#374151",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderTopRightRadius: "6px",
                        borderBottomRightRadius: "6px",
                        cursor:
                          currentPageDisplay >= totalPages || totalPages === 0
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(event) => {
                        if (currentPageDisplay < totalPages && totalPages > 0) {
                          event.currentTarget.style.backgroundColor = "#f9fafb";
                          event.currentTarget.style.borderColor = "#d1d5db";
                        }
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor = "white";
                        event.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      Next
                    </button>
                  </nav>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>
                      Go to
                    </span>
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
                      style={{
                        width: "52px",
                        height: "34px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontSize: "14px",
                        outline: "none",
                        padding: "0 4px",
                      }}
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


































