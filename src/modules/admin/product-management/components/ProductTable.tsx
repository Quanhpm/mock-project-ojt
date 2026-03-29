import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProductSearch } from "../hooks/use-product-search.hook";
import { useDeleteProduct } from "./hooks/useDeleteProduct";
import { useRestoreProduct } from "./hooks/useRestoreProduct";
import { useGetProductById } from "./hooks/useGetProductById";
import ProductDelete from "./ProductDelete";
import ProductRestore from "./ProductRestore";
import ProductDetailsModal from "./ProductDetailsModal";
import EditProductModal from "./EditProductModal";
import AssignFranchiseModal from "./AssignFranchiseModal";
import {
  getFranchiseId,
  getTableScope,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { getFranchisesForSelect, type FranchiseSelectItem } from "@/apis/endpoints/user.api";
import { ROUTER_URL } from "@/routes/router.const";

// Add CSS keyframes for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @media (max-width: 1024px) {
    [data-product-shell] {
      height: auto;
      min-height: 100dvh;
      overflow-x: hidden;
    }

    [data-product-main] {
      height: auto;
      min-height: 100dvh;
      overflow: visible;
    }

    [data-product-header],
    [data-product-content] {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    [data-product-content] {
      overflow: visible !important;
    }

    [data-product-toolbar-actions],
    [data-product-search-row],
    [data-product-filter-row] {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    [data-product-toolbar-actions] > *,
    [data-product-search-row] > *,
    [data-product-filter-row] > * {
      width: 100% !important;
      min-width: 0 !important;
    }

    [data-product-search-row] > button,
    [data-product-filter-row] > button {
      width: 100%;
      justify-content: center;
    }

    [data-product-search-field] {
      flex: 0 0 auto !important;
    }

    [data-product-table-wrap] {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    [data-product-table-wrap] table {
      min-width: 920px;
    }

    [data-product-pagination] {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    [data-product-pagination] > div,
    [data-product-pagination] nav {
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
`;
if (!document.head.querySelector("style[data-product-table]")) {
  styleSheet.setAttribute("data-product-table", "true");
  document.head.appendChild(styleSheet);
}

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatPriceRange = (minPrice: number, maxPrice: number) => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }

  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

export default function ProductTable() {
  const location = useLocation();
  const navigate = useNavigate();
  const tableScope = useAdminAuthStore((state) => getTableScope(state));
  const activeFranchiseId = useAdminAuthStore((state) => getFranchiseId(state));
  const isGlobalScope = tableScope === "GLOBAL_TABLE_SCOPE";
  const {
    products,
    isLoading,
    filters,
    setFilters,
    executeSearch,
    clearFilters,
    searchHistory,
    clearHistory,
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
  } = useProductSearch({ tableScope });

  const { deleteProduct: deleteProductAPI, isDeleting } = useDeleteProduct();
  const { restoreProduct: restoreProductAPI, isRestoring } = useRestoreProduct();
  const {
    product: selectedProduct,
    isLoading: isLoadingProduct,
    fetchProduct,
    clearProduct,
  } = useGetProductById();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState(filters.keyword);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(-1);
  const [franchiseOptions, setFranchiseOptions] = useState<FranchiseSelectItem[]>([]);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
  });

  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
  });

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    productId: string;
  }>({
    isOpen: false,
    productId: "",
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    productId: string;
  }>({
    isOpen: false,
    productId: "",
  });

  const [franchiseModal, setFranchiseModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
  });
  const [pageInput, setPageInput] = useState("");
  const hasInitializedFilterSearch = useRef(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const isMobileViewport = !isDesktopViewport;

  // Track if we need to check pagination after deletion
  const [shouldCheckPagination, setShouldCheckPagination] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Remove page scroll
  React.useEffect(() => {
    document.body.style.overflow = isDesktopViewport ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDesktopViewport]);

  // ── Handle pagination after deletion ────────────────────────────
  // If page is empty after deletion and we're not on page 1, go back to page 1
  React.useEffect(() => {
    if (
      shouldCheckPagination &&
      products.length === 0 &&
      currentPage > 1 &&
      !isLoading
    ) {
      setShouldCheckPagination(false);
      setCurrentPage(1);
    } else if (shouldCheckPagination && !isLoading) {
      setShouldCheckPagination(false);
    }
  }, [
    shouldCheckPagination,
    products.length,
    currentPage,
    isLoading,
    setCurrentPage,
  ]);

  useEffect(() => {
    if (!isGlobalScope) {
      setFranchiseOptions([]);
      return;
    }

    const loadFranchises = async () => {
      try {
        const result = await getFranchisesForSelect();
        setFranchiseOptions(result ?? []);
      } catch (error) {
        console.error("Failed to load franchises:", error);
      }
    };

    void loadFranchises();
  }, [isGlobalScope]);

  useEffect(() => {
    setSearchInput(filters.keyword);
  }, [filters.keyword]);

  // Keyboard shortcuts - Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchDropdownOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchDropdownOpen]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchDropdownOpen]);

  // Auto-correct currentPage if it exceeds totalPages after deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  // Handle search input keyboard navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchDropdownOpen || searchHistory.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        void handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedHistoryIndex((prev) =>
          prev < searchHistory.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedHistoryIndex >= 0) {
          void handleSearch(searchHistory[selectedHistoryIndex]);
        } else {
          void handleSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
        break;
    }
  };

  const handleSearch = async (nextKeyword?: string) => {
    const trimmedKeyword = (nextKeyword ?? searchInput).trim();
    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    setSearchInput(trimmedKeyword);
    setFilters((prev) => ({
      ...prev,
      keyword: trimmedKeyword,
    }));

    if (currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    await executeSearch({
      keyword: trimmedKeyword,
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSelectedHistoryIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleDeletedFilterChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, is_deleted: value }));
  };

  const handleFranchiseFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, franchise_id: value }));
  };

  useEffect(() => {
    if (!hasInitializedFilterSearch.current) {
      hasInitializedFilterSearch.current = true;
      return;
    }

    if (currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    void executeSearch();
    // Intentionally omit executeSearch from deps to avoid resetting currentPage when callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.franchise_id, filters.is_active, filters.is_deleted]);

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;

    deleteProductAPI(deleteModal.productId, async () => {
      setDeleteModal({ isOpen: false, productId: "", productName: "" });
      setShouldCheckPagination(true);
      await executeSearch();
    });
  };

  const handleRestoreClick = (productId: string, productName: string) => {
    setRestoreModal({
      isOpen: true,
      productId,
      productName,
    });
  };

  const handleRestoreConfirm = async () => {
    if (isRestoring) return;

    restoreProductAPI(restoreModal.productId, async () => {
      setRestoreModal({ isOpen: false, productId: "", productName: "" });
      await executeSearch();
    });
  };

  const handleEditClick = (productId: string) => {
    setEditModal({
      isOpen: true,
      productId,
    });
    void fetchProduct(productId);
  };

  const handleViewClick = (productId: string) => {
    setDetailsModal({
      isOpen: true,
      productId,
    });
    void fetchProduct(productId);
  };

  const editingProduct =
    selectedProduct?.id === editModal.productId ? selectedProduct : null;
  const detailProduct =
    selectedProduct?.id === detailsModal.productId ? selectedProduct : null;

  const handleCloseDetailsModal = () => {
    setDetailsModal({ isOpen: false, productId: "" });
    clearProduct();
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, productId: "" });
    clearProduct();
  };

  const navigateToProductFranchise = (
    franchiseId: string,
    franchiseName?: string,
  ) => {
    if (!franchiseId) return;

    const searchParams = new URLSearchParams({
      franchise_id: franchiseId,
    });

    navigate(
      `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.PRODUCT_FRANCHISE_MANAGEMENT}?${searchParams.toString()}`,
      {
        state: {
          franchiseName,
          returnTo: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      },
    );
  };

  const handleChooseFranchiseNavigation = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedFranchiseId = event.target.value;
    if (!selectedFranchiseId) return;

    const selectedFranchise = franchiseOptions.find(
      (item) => item.value === selectedFranchiseId,
    );

    navigateToProductFranchise(selectedFranchiseId, selectedFranchise?.name);
    event.target.value = "";
  };

  return (
    <div
      data-product-shell
      style={{
        display: "flex",
        minHeight: "100dvh",
        width: "100%",
        overflowX: "hidden",
        overflowY: isDesktopViewport ? "hidden" : "visible",
      }}
    >
      {/* Main Content */}
      <main
        data-product-main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          overflow: isDesktopViewport ? "hidden" : "visible",
          position: "relative",
        }}
      >
        {/* Top Header & Breadcrumbs */}
        <header
          data-product-header
          style={{
            width: "100%",
            padding: isDesktopViewport ? "24px 32px" : "20px 16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: isDesktopViewport ? "24px" : "20px",
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
              }}
            >
              <a
                href="#"
                style={{
                  color: "#6c757d",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                Home
              </a>
              <span style={{ fontSize: "16px" }}>{">"}</span>
              <span style={{ color: "#212529", fontWeight: "500" }}>
                Products
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}
            >
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  letterSpacing: "-0.025em",
                  color: "#212529",
                  margin: 0,
                }}
              >
                Product Management
              </h2>
              <p style={{ color: "#6c757d", margin: 0 }}>
                {filters.is_deleted ? "Deleted Products" : "Current Products"}:{" "}
                {isLoading ? "..." : totalItems}
              </p>
            </div>
            <div
              data-product-toolbar-actions
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                flexWrap: "wrap",
                width: isMobileViewport ? "100%" : "auto",
              }}
            >
              {isGlobalScope ? (
                <select
                  defaultValue=""
                  onChange={handleChooseFranchiseNavigation}
                  style={{
                    width: isMobileViewport ? "100%" : "220px",
                    minWidth: isMobileViewport ? 0 : "220px",
                    height: "44px",
                    padding: "0 16px",
                    borderRadius: "10px",
                    border: "1px solid #d6d3d1",
                    backgroundColor: "#ffffff",
                    color: "#44403c",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                  title="Choose Franchise"
                >
                  <option value="">Choose Franchise</option>
                  {franchiseOptions.map((franchise) => (
                    <option key={franchise.value} value={franchise.value}>
                      {franchise.name}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    activeFranchiseId
                      ? navigateToProductFranchise(activeFranchiseId)
                      : undefined
                  }
                  disabled={!activeFranchiseId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#ffffff",
                    color: "#6b4f3a",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "1px solid #d6d3d1",
                    transition: "all 0.2s",
                    cursor: activeFranchiseId ? "pointer" : "not-allowed",
                    fontWeight: "700",
                    fontSize: "14px",
                    opacity: activeFranchiseId ? 1 : 0.6,
                    width: isMobileViewport ? "100%" : "auto",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    storefront
                  </span>
                  <span>Current Franchise</span>
                </button>
              )}

              <button
                onClick={() => navigate("/admin/products/create")}
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
                  cursor: "pointer",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "14px",
                  width: isMobileViewport ? "100%" : "auto",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#6d3610")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#8B4513")
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  add
                </span>
                <span>Create Product</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area - No Scroll */}
        <div
          data-product-content
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: isDesktopViewport ? "0 32px 32px" : "0 16px 24px",
            overflow: isDesktopViewport ? "hidden" : "visible",
            minHeight: 0,
          }}
        >
          {/* Filters & Toolbar - Fixed */}
          <div
            data-product-filter-panel
            style={{
              backgroundColor: "#ffffff",
              padding: isMobileViewport ? "14px" : "16px",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              marginBottom: isMobileViewport ? "16px" : "24px",
              flexShrink: 0,
              boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
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
                data-product-search-row
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                {/* Advanced Search Bar */}
                <div
                  data-product-search-field
                  style={{ flex: isMobileViewport ? "0 0 auto" : "1 1 360px", minWidth: 0, position: "relative" }}
                  ref={dropdownRef}
                >
                  <div style={{ position: "relative" }}>
                    {/* Search Icon */}
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

                    {/* Search Input */}
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (e.target.value.trim()) {
                          setIsSearchDropdownOpen(false);
                        }
                      }}
                      onFocus={() => {
                        if (!searchInput.trim() && searchHistory.length > 0) {
                          setIsSearchDropdownOpen(true);
                        }
                      }}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search by product name or SKU... (Ctrl+K)"
                      className="focus:outline-none focus:ring-2 focus:ring-[#c6a27f] focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        border: "1px solid #d9dee7",
                        padding: "0 16px 0 42px",
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                        fontSize: "15px",
                        boxSizing: "border-box",
                      }}
                    />

                    {/* Clear Button */}
                    {searchInput && (
                      <button
                        onClick={handleClearSearch}
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#e2e8f0";
                          e.currentTarget.style.color = "#334155";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f1f5f9";
                          e.currentTarget.style.color = "#64748b";
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
                    )}
                  </div>

                  {/* Search Dropdown - History & Suggestions */}
                  {isSearchDropdownOpen &&
                    searchHistory.length > 0 &&
                    !searchInput && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                          zIndex: 50,
                          maxHeight: "250px",
                          overflowY: "auto",
                        }}
                      >
                        <div
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#6c757d",
                              textTransform: "uppercase",
                            }}
                          >
                            Recent searches
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearHistory();
                              setIsSearchDropdownOpen(false);
                            }}
                            style={{
                              fontSize: "11px",
                              color: "#ef4444",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#fee")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            Clear
                          </button>
                        </div>
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSearchInput(item);
                              setIsSearchDropdownOpen(false);
                              setSelectedHistoryIndex(-1);
                            }}
                            style={{
                              padding: "10px 12px",
                              cursor: "pointer",
                              transition: "background-color 0.15s",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              backgroundColor:
                                selectedHistoryIndex === index
                                  ? "#f8fafc"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (selectedHistoryIndex !== index) {
                                e.currentTarget.style.backgroundColor =
                                  "#f8fafc";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedHistoryIndex !== index) {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ color: "#9ca3af" }}
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span
                              style={{ fontSize: "14px", color: "#212529" }}
                            >
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Search Button */}
                <button
                  onClick={() => {
                    void handleSearch();
                  }}
                  disabled={isLoading}
                  style={{
                    height: "48px",
                    minWidth: isMobileViewport ? undefined : "120px",
                    width: isMobileViewport ? "100%" : "auto",
                    padding: "0 16px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#8B4513",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    opacity: isLoading ? 0.6 : 1,
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading)
                      e.currentTarget.style.backgroundColor = "#6d3610";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#8B4513";
                  }}
                >
                  {isLoading ? (
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
                data-product-filter-row
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                {isGlobalScope && (
                  <select
                    value={filters.franchise_id || ""}
                    onChange={(e) => handleFranchiseFilterChange(e.target.value)}
                    style={{
                      display: "block",
                      width: isMobileViewport ? "100%" : "auto",
                      minWidth: isMobileViewport ? 0 : "180px",
                      height: "44px",
                      appearance: "none",
                      borderRadius: "10px",
                      border: "1px solid #d9dee7",
                      padding: "0 38px 0 14px",
                      color: "#111827",
                      backgroundColor: "#fcfcfd",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#bdbdbd")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#d1d5db")
                    }
                  >
                    <option value="">All Franchise</option>
                    {franchiseOptions.map((franchise) => (
                      <option key={franchise.value} value={franchise.value}>
                        {franchise.name}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => handleDeletedFilterChange(!filters.is_deleted)}
                  style={{
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: `1px solid ${filters.is_deleted ? "#fb923c" : "#d1d5db"}`,
                    backgroundColor: filters.is_deleted ? "#fff7ed" : "#fcfcfd",
                    color: filters.is_deleted ? "#f97316" : "#6b7280",
                    fontWeight: 500,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    width: isMobileViewport ? "100%" : "auto",
                    boxShadow: filters.is_deleted ? "0 0 0 1px rgba(249,115,22,0.08)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = filters.is_deleted
                      ? "#fb923c"
                      : "#cbd5e1";
                    e.currentTarget.style.backgroundColor = filters.is_deleted
                      ? "#fff7ed"
                      : "#f8fafc";
                    e.currentTarget.style.color = filters.is_deleted
                      ? "#ea580c"
                      : "#475569";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = filters.is_deleted
                      ? "#f2d1a1"
                      : "#d1d5db";
                    e.currentTarget.style.backgroundColor = filters.is_deleted
                      ? "#fbf2e3"
                      : "#ffffff";
                    e.currentTarget.style.color = filters.is_deleted
                      ? "#f97316"
                      : "#64748b";
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    delete_outline
                  </span>
                  {filters.is_deleted ? "Deleted" : "Current"}
                </button>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  style={{
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "1px solid #d9dee7",
                    backgroundColor: "#f4f6f8",
                    color: "#334155",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    width: isMobileViewport ? "100%" : "auto",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#1f2937";
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#334155";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          {/* Table Container - Scrollable */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <div
              data-product-table-wrap
              style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "auto" }}
            >
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  textAlign: "left",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <th
                      style={{
                        width: "45%",
                        padding: "12px 16px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        width: "18%",
                        padding: "12px 16px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      SKU
                    </th>
                    <th
                      style={{
                        width: "22%",
                        padding: "12px 16px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Price
                    </th>
                    <th
                      style={{
                        width: "15%",
                        padding: "12px 16px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: "1px solid #e9ecef" }}>
                  {isLoading ? (
                    // Loading Skeleton
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #f8f9fa" }}
                      >
                        <td colSpan={4} style={{ padding: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                backgroundColor: "#e0e0e0",
                                animation: "pulse 1.5s ease-in-out infinite",
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  height: "16px",
                                  backgroundColor: "#e0e0e0",
                                  borderRadius: "4px",
                                  marginBottom: "8px",
                                  width: "60%",
                                  animation: "pulse 1.5s ease-in-out infinite",
                                }}
                              />
                              <div
                                style={{
                                  height: "12px",
                                  backgroundColor: "#f0f0f0",
                                  borderRadius: "4px",
                                  width: "40%",
                                  animation: "pulse 1.5s ease-in-out infinite",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    // Empty State
                    <tr>
                      <td
                        colSpan={4}
                        style={{ padding: "60px 40px", textAlign: "center" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%",
                              backgroundColor: "#f8f9fa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9ca3af"
                              strokeWidth="1.5"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.35-4.35" />
                            </svg>
                          </div>
                          <div>
                            <h3
                              style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#212529",
                                margin: "0 0 8px 0",
                              }}
                            >
                              No results found
                            </h3>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "#6c757d",
                                margin: 0,
                              }}
                            >
                              {filters.keyword
                                ? `No products match "${filters.keyword}"`
                                : filters.is_deleted
                                  ? "No deleted products are available to display"
                                  : "No products are available to display"}
                            </p>
                          </div>
                          {(filters.keyword ||
                            filters.is_active ||
                            filters.min_price ||
                            filters.max_price) && (
                            <button
                              onClick={clearFilters}
                              style={{
                                marginTop: "8px",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: "1px solid #e0e0e0",
                                backgroundColor: "white",
                                color: "#3b82f6",
                                fontSize: "14px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#eff6ff";
                                e.currentTarget.style.borderColor = "#3b82f6";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "#e0e0e0";
                              }}
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.tableRowId}
                        style={{
                          transition: "background-color 0.2s",
                          borderBottom: "1px solid #f8f9fa",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                objectFit: "cover",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  color: "#212529",
                                }}
                              >
                                {product.name}
                              </span>
                              {product.sizeLabel && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#8B4513",
                                    fontWeight: "600",
                                  }}
                                >
                                  Size: {product.sizeLabel}
                                </span>
                              )}
                              {product.franchiseName && (
                                <span
                                  style={{ fontSize: "12px", color: "#6c757d" }}
                                >
                                  {product.franchiseName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: "#f5e6d3",
                              color: "#8B4513",
                            }}
                          >
                            {product.SKU}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#212529",
                          }}
                        >
                          {formatPriceRange(
                            product.min_price ?? 0,
                            product.max_price ?? product.min_price ?? 0,
                          )}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={() => {
                                void handleViewClick(product.masterProductId);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                border: "none",
                                borderRadius: "6px",
                                backgroundColor: "transparent",
                                color: "#94a3b8",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "rgba(51, 102, 204, 0.05)";
                                e.currentTarget.style.color = "#3366cc";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                              title="View Details"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "20px" }}
                              >
                                visibility
                              </span>
                            </button>
                            {!product.is_deleted && (
                              <button
                                onClick={() => {
                                  void handleEditClick(product.masterProductId);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "32px",
                                  height: "32px",
                                  border: "none",
                                  borderRadius: "6px",
                                  backgroundColor: "transparent",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(67, 56, 202, 0.08)";
                                  e.currentTarget.style.color = "#4338ca";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                                title="Edit"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                  edit
                                </span>
                              </button>
                            )}
                            {isGlobalScope && !filters.is_deleted && (
                              <button
                                onClick={() =>
                                  setFranchiseModal({
                                    isOpen: true,
                                    productId: product.masterProductId,
                                    productName: product.name,
                                  })
                                }
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "32px",
                                  height: "32px",
                                  border: "none",
                                  borderRadius: "6px",
                                  backgroundColor: "transparent",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "rgba(139, 69, 19, 0.05)";
                                  e.currentTarget.style.color = "#8B4513";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                                title="Assign Franchise"
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: "20px" }}
                                >
                                  storefront
                                </span>
                              </button>
                            )}

                            {/* Delete or Restore Button */}
                            {filters.is_deleted ? (
                              <button
                                onClick={() =>
                                  handleRestoreClick(product.masterProductId, product.name)
                                }
                                disabled={isRestoring}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "32px",
                                  height: "32px",
                                  border: "none",
                                  borderRadius: "6px",
                                  backgroundColor: "transparent",
                                  color: "#94a3b8",
                                  cursor: isRestoring
                                    ? "not-allowed"
                                    : "pointer",
                                  transition: "all 0.2s",
                                  opacity: isRestoring ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isRestoring) {
                                    e.currentTarget.style.backgroundColor =
                                      "rgba(76, 175, 80, 0.05)";
                                    e.currentTarget.style.color = "#4caf50";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                                title="Restore"
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: "20px" }}
                                >
                                  restore
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDeleteClick(product.masterProductId, product.name)
                                }
                                disabled={isDeleting}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "32px",
                                  height: "32px",
                                  border: "none",
                                  borderRadius: "6px",
                                  backgroundColor: "transparent",
                                  color: "#94a3b8",
                                  cursor: isDeleting
                                    ? "not-allowed"
                                    : "pointer",
                                  transition: "all 0.2s",
                                  opacity: isDeleting ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isDeleting) {
                                    e.currentTarget.style.backgroundColor =
                                      "#fee";
                                    e.currentTarget.style.color = "#ef4444";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                                title="Delete"
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: "20px" }}
                                >
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Fixed at Bottom */}
            {totalPages > 0 && (
              <div
                data-product-pagination
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #e9ecef",
                  backgroundColor: "#f8f9fa",
                  padding: isMobileViewport ? "16px" : "12px 24px",
                  flexShrink: 0,
                }}
              >
                <div
                  data-product-pagination-inner
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: isMobileViewport ? "stretch" : "center",
                    justifyContent: isMobileViewport ? "center" : "space-between",
                    flexDirection: isMobileViewport ? "column" : "row",
                    gap: isMobileViewport ? "12px" : "16px",
                  }}
                >
                  <div style={{ textAlign: isMobileViewport ? "center" : "left" }}>
                    <p
                      style={{ fontSize: "14px", color: "#495057", margin: 0 }}
                    >
                      Showing page{" "}
                      <span style={{ fontWeight: "500" }}>{currentPage}</span>{" "}
                      of{" "}
                      <span style={{ fontWeight: "500" }}>{totalPages}</span>{" "}
                      (
                      <span style={{ fontWeight: "500" }}>{totalItems}</span>{" "}
                      products)
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isMobileViewport ? "center" : "flex-start",
                      gap: "8px",
                      flexWrap: isMobileViewport ? "wrap" : "nowrap",
                    }}
                  >
                    <nav
                      aria-label="Pagination"
                      style={{ display: "inline-flex", flexWrap: isMobileViewport ? "wrap" : "nowrap", justifyContent: "center" }}
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "8px 16px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: currentPage === 1 ? "#9ca3af" : "#374151",
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderTopLeftRadius: "6px",
                          borderBottomLeftRadius: "6px",
                          borderRight: "none",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== 1) {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                            e.currentTarget.style.borderColor = "#d1d5db";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        Previous
                      </button>
                      {(() => {
                        const pages: (number | "...")[] = [];
                        if (totalPages <= 5) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          const ws = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
                          const we = ws + 2;
                          if (ws > 2) pages.push(1, "..."); else for (let i = 1; i < ws; i++) pages.push(i);
                          for (let i = ws; i <= we; i++) pages.push(i);
                          if (we < totalPages - 1) pages.push("...", totalPages); else for (let i = we + 1; i <= totalPages; i++) pages.push(i);
                        }
                        return pages.map((page, idx) =>
                          page === "..." ? (
                            <span key={`e-${idx}`} style={{ display: "inline-flex", alignItems: "center", padding: "0 4px", fontSize: "14px", color: "#6b7280" }}>...</span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "40px",
                                padding: "8px 12px",
                                fontSize: "14px",
                                fontWeight: currentPage === page ? "600" : "500",
                                color: currentPage === page ? "white" : "#374151",
                                backgroundColor: currentPage === page ? "#8B4513" : "white",
                                border: "1px solid",
                                borderColor: currentPage === page ? "#8B4513" : "#e5e7eb",
                                borderRight: "none",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                if (currentPage !== page) {
                                  e.currentTarget.style.backgroundColor = "#f9fafb";
                                  e.currentTarget.style.borderColor = "#d1d5db";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (currentPage !== page) {
                                  e.currentTarget.style.backgroundColor = "white";
                                  e.currentTarget.style.borderColor = "#e5e7eb";
                                } else {
                                  e.currentTarget.style.backgroundColor = "#8B4513";
                                  e.currentTarget.style.borderColor = "#8B4513";
                                }
                              }}
                            >
                              {page}
                            </button>
                          )
                        );
                      })()}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "8px 16px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color:
                            currentPage === totalPages ? "#9ca3af" : "#374151",
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderTopRightRadius: "6px",
                          borderBottomRightRadius: "6px",
                          cursor:
                            currentPage === totalPages
                              ? "not-allowed"
                              : "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== totalPages) {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                            e.currentTarget.style.borderColor = "#d1d5db";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        Next
                      </button>
                    </nav>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        flexWrap: isMobileViewport ? "wrap" : "nowrap",
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>Go to</span>
                      <input
                        type="number" min={1} max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const n = parseInt(pageInput, 10);
                            if (!isNaN(n) && n >= 1 && n <= totalPages) setCurrentPage(n);
                            setPageInput("");
                          }
                        }}
                        placeholder={String(currentPage)}
                        style={{ width: "52px", height: "34px", border: "1px solid #e5e7eb", borderRadius: "6px", textAlign: "center", fontSize: "14px", outline: "none", padding: "0 4px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      <ProductDelete
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, productId: "", productName: "" })
        }
        onConfirm={handleDeleteConfirm}
        productName={deleteModal.productName}
        productId={deleteModal.productId}
      />

      {/* Restore Modal */}
      <ProductRestore
        isOpen={restoreModal.isOpen}
        onClose={() =>
          setRestoreModal({ isOpen: false, productId: "", productName: "" })
        }
        onConfirm={handleRestoreConfirm}
        productName={restoreModal.productName}
        productId={restoreModal.productId}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={handleCloseDetailsModal}
        product={detailProduct}
        isLoading={detailsModal.isOpen && isLoadingProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        product={editingProduct}
        isLoading={editModal.isOpen && isLoadingProduct}
        onUpdated={() => {
          handleCloseEditModal();
          void executeSearch();
        }}
      />

      {/* Assign Franchise Modal (Flow 2: from table action) */}
      <AssignFranchiseModal
        isOpen={franchiseModal.isOpen}
        onClose={() =>
          setFranchiseModal({
            isOpen: false,
            productId: "",
            productName: "",
          })
        }
        onSuccess={() => {
          setFranchiseModal({
            isOpen: false,
            productId: "",
            productName: "",
          });
          executeSearch();
        }}
        productId={franchiseModal.productId}
        productName={franchiseModal.productName}
      />
    </div>
  );
}
