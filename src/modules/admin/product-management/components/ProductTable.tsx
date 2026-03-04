import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductSearch } from "./hooks/useProductSearch";
import { searchProducts } from "./product.api";
import type { Product } from "./product.types";
import { SearchBar } from "@/components/ui/search-bar";

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ProductTable() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showDeleted, setShowDeleted] = useState(false);

  // Use the professional search hook
  const {
    searchTerm,
    setSearchTerm,
    results: products,
    isSearching,
    searchHistory,
    clearSearch,
    removeFromHistory,
    handleManualSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    setFilters,
  } = useProductSearch<Product>(searchProducts as any, {
    enableHistory: true,
    maxHistoryItems: 10,
    initialPageSize: 10,
  });

  // Update filters when status or deleted filter changes
  React.useEffect(() => {
    setFilters({
      is_deleted: showDeleted,
      ...(statusFilter !== "all" && { is_active: statusFilter === "active" }),
    });
  }, [statusFilter, showDeleted, setFilters]);

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
                Total Products: {isSearching ? "..." : totalItems}
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

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "0 32px 32px",
            overflow: "hidden",
          }}
        >
          {/* Professional Search Bar & Filters */}
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
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
                flexDirection: "column",
              }}
            >
              {/* Search Bar with Button - Full Width */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onClear={clearSearch}
                    onSearch={handleManualSearch}
                    isLoading={isSearching}
                    placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
                    suggestions={searchHistory}
                    onSuggestionClick={setSearchTerm}
                    onRemoveSuggestion={removeFromHistory}
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleManualSearch}
                  disabled={isSearching}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: isSearching ? "#ccc" : "#8B4513",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: isSearching ? "not-allowed" : "pointer",
                    border: "none",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isSearching ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSearching) {
                      e.currentTarget.style.backgroundColor = "#6d3610";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSearching) {
                      e.currentTarget.style.backgroundColor = "#8B4513";
                    }
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    search
                  </span>
                  <span>Tìm kiếm</span>
                </button>
              </div>

              {/* Filters Row */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "active" | "inactive",
                    )
                  }
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
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>

                {/* Show Deleted Toggle */}
                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: showDeleted ? "#fff3e0" : "white",
                    color: showDeleted ? "#f57c00" : "#6c757d",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    {showDeleted ? "visibility" : "visibility_off"}
                  </span>
                  {showDeleted ? "Đang xem đã xóa" : "Xem đã xóa"}
                </button>

                {/* Info Text */}
                <div
                  style={{
                    marginLeft: "auto",
                    color: "#6c757d",
                    fontSize: "14px",
                  }}
                >
                  Tìm thấy <strong>{totalItems}</strong> sản phẩm
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Table */}
            <div style={{ flex: 1, overflow: "auto" }}>
              {isSearching ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    🔍
                  </div>
                  <p style={{ color: "#6c757d", fontSize: "16px" }}>
                    Đang tìm kiếm...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    📦
                  </div>
                  <p
                    style={{
                      color: "#6c757d",
                      fontSize: "16px",
                      marginBottom: "8px",
                    }}
                  >
                    Không tìm thấy sản phẩm nào
                  </p>
                  {searchTerm && (
                    <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                      Thử tìm kiếm với từ khóa khác hoặc{" "}
                      <button
                        onClick={clearSearch}
                        style={{
                          color: "#3b82f6",
                          textDecoration: "underline",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                        }}
                      >
                        xóa bộ lọc
                      </button>
                    </p>
                  )}
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #e9ecef",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#495057",
                          fontSize: "14px",
                        }}
                      >
                        Hình ảnh
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#495057",
                          fontSize: "14px",
                        }}
                      >
                        SKU
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#495057",
                          fontSize: "14px",
                        }}
                      >
                        Tên sản phẩm
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#495057",
                          fontSize: "14px",
                        }}
                      >
                        Giá
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#495057",
                          fontSize: "14px",
                        }}
                      >
                        Trạng thái
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#495057",
                          fontSize: "14px",
                        }}
                      >
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: "1px solid #e9ecef",
                          transition: "background-color 0.2s",
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
                          <img
                            src={
                              product.image_url ||
                              "https://via.placeholder.com/60"
                            }
                            alt={product.name}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            fontSize: "14px",
                            color: "#6c757d",
                            fontFamily: "monospace",
                          }}
                        >
                          {product.SKU}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            fontSize: "14px",
                            color: "#212529",
                            fontWeight: "500",
                          }}
                        >
                          {product.name}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            fontSize: "14px",
                            color: "#212529",
                          }}
                        >
                          {formatPrice(product.min_price)} -{" "}
                          {formatPrice(product.max_price)}
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor: product.is_active
                                ? "#d4edda"
                                : "#f8d7da",
                              color: product.is_active ? "#155724" : "#721c24",
                            }}
                          >
                            {product.is_active ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <button
                            onClick={() =>
                              navigate(`/admin/products/edit/${product.id}`)
                            }
                            style={{
                              padding: "8px 16px",
                              borderRadius: "6px",
                              border: "1px solid #3b82f6",
                              backgroundColor: "white",
                              color: "#3b82f6",
                              fontSize: "13px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#3b82f6";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "white";
                              e.currentTarget.style.color = "#3b82f6";
                            }}
                          >
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: "20px",
                  borderTop: "1px solid #e9ecef",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <div style={{ color: "#6c757d", fontSize: "14px" }}>
                  Trang {currentPage} / {totalPages}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: currentPage === 1 ? "#f5f5f5" : "white",
                      color: currentPage === 1 ? "#9e9e9e" : "#212529",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #e0e0e0",
                      backgroundColor:
                        currentPage === totalPages ? "#f5f5f5" : "white",
                      color: currentPage === totalPages ? "#9e9e9e" : "#212529",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
