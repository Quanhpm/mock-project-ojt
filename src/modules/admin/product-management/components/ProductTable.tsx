import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProductSearch } from "../hooks/use-product-search.hook";
import { useDeleteProduct } from "./hooks/useDeleteProduct";
import { useRestoreProduct } from "./hooks/useRestoreProduct";
import { useToggleProductStatus } from "./hooks/useToggleProductStatus";
import { useGetProductById } from "./hooks/useGetProductById";
import ProductDelete from "./ProductDelete";
import ProductRestore from "./ProductRestore";
import ProductDetailsModal from "./ProductDetailsModal";

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
`;
if (!document.head.querySelector("style[data-product-table]")) {
  styleSheet.setAttribute("data-product-table", "true");
  document.head.appendChild(styleSheet);
}

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ProductTable() {
  const navigate = useNavigate();
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
  } = useProductSearch();

  const { deleteProduct: deleteProductAPI, isDeleting } = useDeleteProduct();
  const { restoreProduct: restoreProductAPI, isRestoring } =
    useRestoreProduct();
  const { toggleStatus } = useToggleProductStatus();
  const {
    product: selectedProduct,
    isLoading: isLoadingProduct,
    fetchProduct,
  } = useGetProductById();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(-1);

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

  // Remove page scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

  // Handle search input keyboard navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchDropdownOpen || searchHistory.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
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
          setFilters((prev) => ({
            ...prev,
            keyword: searchHistory[selectedHistoryIndex],
          }));
          setIsSearchDropdownOpen(false);
          setSelectedHistoryIndex(-1);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    executeSearch();
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, keyword: "" }));
    searchInputRef.current?.focus();
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, is_active: value }));
  };

  const handleDeletedFilterChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, is_deleted: value }));
  };

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
      await executeSearch();
    });
  };

  const handleToggleStatus = async (
    productId: string,
    currentStatus: boolean,
  ) => {
    await toggleStatus(
      productId,
      currentStatus,
      async () => {
        await executeSearch();
      },
      async () => {
        await executeSearch();
      },
    );
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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Main Content */}
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
        {/* Top Header & Breadcrumbs */}
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
              <span style={{ fontSize: "16px" }}>›</span>
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
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
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
                Total Products: {isLoading ? "..." : totalItems}
              </p>
            </div>
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
        </header>

        {/* Content Area - No Scroll */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "0 32px 32px",
            overflow: "hidden",
          }}
        >
          {/* Filters & Toolbar - Fixed */}
          <div
            style={{
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef",
              marginBottom: "24px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  flex: 1,
                  minWidth: "300px",
                }}
              >
                {/* Advanced Search Bar */}
                <div
                  style={{ flex: 1, position: "relative" }}
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
                      value={filters.keyword}
                      onChange={(e) => {
                        setFilters((prev) => ({
                          ...prev,
                          keyword: e.target.value,
                        }));
                        if (e.target.value.trim()) {
                          setIsSearchDropdownOpen(false);
                        }
                      }}
                      onFocus={() => {
                        if (
                          !filters.keyword.trim() &&
                          searchHistory.length > 0
                        ) {
                          setIsSearchDropdownOpen(true);
                        }
                      }}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Tìm kiếm theo tên, mã sản phẩm... (Ctrl+K)"
                      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      style={{
                        display: "block",
                        width: "100%",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        padding: "10px 40px 10px 40px",
                        color: "#212529",
                        backgroundColor: "white",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />

                    {/* Clear Button */}
                    {filters.keyword && (
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
                          borderRadius: "50%",
                          backgroundColor: "#e0e0e0",
                          color: "#6c757d",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#bdbdbd";
                          e.currentTarget.style.color = "#212529";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#e0e0e0";
                          e.currentTarget.style.color = "#6c757d";
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
                    !filters.keyword && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          zIndex: 50,
                          maxHeight: "250px",
                          overflowY: "auto",
                        }}
                      >
                        <div
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #f0f0f0",
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
                            Tìm kiếm gần đây
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
                            Xóa
                          </button>
                        </div>
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setFilters((prev) => ({
                                ...prev,
                                keyword: item,
                              }));
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
                                  ? "#f8f9fa"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (selectedHistoryIndex !== index) {
                                e.currentTarget.style.backgroundColor =
                                  "#f8f9fa";
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
                  onClick={handleSearch}
                  disabled={isLoading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#8b5a2b",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading)
                      e.currentTarget.style.backgroundColor = "#6d4522";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#8b5a2b";
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
                      Đang tìm...
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
                      Tìm kiếm
                    </>
                  )}
                </button>
              </div>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                {/* Status Filter */}
                <select
                  value={filters.is_active}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "white",
                    color: "#212529",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#bdbdbd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#e0e0e0")
                  }
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>

                {/* Show Deleted Toggle */}
                <button
                  onClick={() => handleDeletedFilterChange(!filters.is_deleted)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: filters.is_deleted ? "#fff3e0" : "white",
                    color: filters.is_deleted ? "#f57c00" : "#6c757d",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = filters.is_deleted
                      ? "#f57c00"
                      : "#bdbdbd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    delete_outline
                  </span>
                  {filters.is_deleted ? "Đã xóa" : "Hiện tại"}
                </button>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "white",
                    color: "#6c757d",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#212529";
                    e.currentTarget.style.borderColor = "#bdbdbd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#6c757d";
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                >
                  Xóa bộ lọc
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
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
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
                        padding: "12px 16px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Product ID
                    </th>
                    <th
                      style={{
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
                        padding: "12px 16px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
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
                        <td colSpan={6} style={{ padding: "16px" }}>
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
                        colSpan={6}
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
                              Không tìm thấy kết quả
                            </h3>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "#6c757d",
                                margin: 0,
                              }}
                            >
                              {filters.keyword
                                ? `Không có sản phẩm nào khớp với "${filters.keyword}"`
                                : "Không có sản phẩm nào để hiển thị"}
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
                              Xóa bộ lọc
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
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
                        <td
                          style={{
                            padding: "16px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#495057",
                          }}
                        >
                          {product.id}
                        </td>
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
                          {formatPrice(product.min_price)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <label
                            style={{
                              position: "relative",
                              display: "inline-block",
                              width: "44px",
                              height: "24px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={product.is_active}
                              onChange={() =>
                                handleToggleStatus(
                                  product.id,
                                  product.is_active,
                                )
                              }
                              style={{
                                opacity: 0,
                                width: 0,
                                height: 0,
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: product.is_active
                                  ? "#8B4513"
                                  : "#ccc",
                                borderRadius: "24px",
                                transition: "background-color 0.3s",
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  content: "",
                                  height: "18px",
                                  width: "18px",
                                  left: product.is_active ? "23px" : "3px",
                                  bottom: "3px",
                                  backgroundColor: "white",
                                  borderRadius: "50%",
                                  transition: "left 0.3s",
                                }}
                              />
                            </span>
                          </label>
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
                            {/* View Details Button */}
                            <button
                              onClick={async () => {
                                setDetailsModal({
                                  isOpen: true,
                                  productId: product.id,
                                });
                                await fetchProduct(product.id);
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

                            {/* Delete or Restore Button */}
                            {filters.is_deleted ? (
                              <button
                                onClick={() =>
                                  handleRestoreClick(product.id, product.name)
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
                                  handleDeleteClick(product.id, product.name)
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #e9ecef",
                  backgroundColor: "#f8f9fa",
                  padding: "12px 24px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      style={{ fontSize: "14px", color: "#495057", margin: 0 }}
                    >
                      Hiển thị trang{" "}
                      <span style={{ fontWeight: "500" }}>{currentPage}</span>{" "}
                      trong{" "}
                      <span style={{ fontWeight: "500" }}>{totalPages}</span>{" "}
                      trang (
                      <span style={{ fontWeight: "500" }}>{totalItems}</span>{" "}
                      sản phẩm)
                    </p>
                  </div>
                  <div>
                    <nav
                      aria-label="Pagination"
                      style={{ display: "inline-flex" }}
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
                        Trước
                      </button>
                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 3) {
                            pageNum = i + 1;
                          } else {
                            if (currentPage === 1) {
                              pageNum = i + 1;
                            } else if (currentPage === totalPages) {
                              pageNum = totalPages - 2 + i;
                            } else {
                              pageNum = currentPage - 1 + i;
                            }
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "40px",
                                padding: "8px 12px",
                                fontSize: "14px",
                                fontWeight:
                                  currentPage === pageNum ? "600" : "500",
                                color:
                                  currentPage === pageNum ? "white" : "#374151",
                                backgroundColor:
                                  currentPage === pageNum ? "#8B4513" : "white",
                                border: "1px solid",
                                borderColor:
                                  currentPage === pageNum
                                    ? "#8B4513"
                                    : "#e5e7eb",
                                borderRight: "none",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                if (currentPage !== pageNum) {
                                  e.currentTarget.style.backgroundColor =
                                    "#f9fafb";
                                  e.currentTarget.style.borderColor = "#d1d5db";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (currentPage !== pageNum) {
                                  e.currentTarget.style.backgroundColor =
                                    "white";
                                  e.currentTarget.style.borderColor = "#e5e7eb";
                                } else {
                                  e.currentTarget.style.backgroundColor =
                                    "#8B4513";
                                  e.currentTarget.style.borderColor = "#8B4513";
                                }
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
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
                        Sau
                      </button>
                    </nav>
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
        onClose={() => setDetailsModal({ isOpen: false, productId: "" })}
        product={selectedProduct}
        isLoading={isLoadingProduct}
      />
    </div>
  );
}
