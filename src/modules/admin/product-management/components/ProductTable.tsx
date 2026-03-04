import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProducts } from "./hooks/useGetProducts";
import { useDeleteProduct } from "./hooks/useDeleteProduct";
import { useRestoreProduct } from "./hooks/useRestoreProduct";
import { useToggleProductStatus } from "./hooks/useToggleProductStatus";
import { useGetProductById } from "./hooks/useGetProductById";
import ProductDelete from "./ProductDelete";
import ProductRestore from "./ProductRestore";
import ProductDetailsModal from "./ProductDetailsModal";

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ProductTable() {
  const navigate = useNavigate();
  const { products, isLoading, refetch } = useGetProducts();
  const { deleteProduct: deleteProductAPI, isDeleting } = useDeleteProduct();
  const { restoreProduct: restoreProductAPI, isRestoring } = useRestoreProduct();
  const { toggleStatus } = useToggleProductStatus();
  const { product: selectedProduct, isLoading: isLoadingProduct, fetchProduct } = useGetProductById();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: "",
    productName: ""
  });
  const [restoreModal, setRestoreModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: "",
    productName: ""
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; productId: string }>({
    isOpen: false,
    productId: ""
  });

  // Remove page scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const itemsPerPage = 5;

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.SKU.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeleteStatus = showDeleted ? product.is_deleted : !product.is_deleted;
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && product.is_active) || 
      (statusFilter === "inactive" && !product.is_active);
    return matchesSearch && matchesDeleteStatus && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const handleDeleteConfirm = () => {
    // Prevent double clicks
    if (isDeleting) return;

    // Call API to delete product
    deleteProductAPI(deleteModal.productId, async () => {
      // onSuccess: Close modal and refresh data
      setDeleteModal({ isOpen: false, productId: "", productName: "" });

      // Refresh product list
      await refetch({
        searchCondition: { is_deleted: false },
        pageInfo: { pageNum: currentPage, pageSize: itemsPerPage },
      });
    });
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    await toggleStatus(productId, currentStatus, async () => {
      await refetch({
        searchCondition: { is_deleted: false },
        pageInfo: { pageNum: currentPage, pageSize: itemsPerPage },
      });
    }, async () => {
      // onError: Refetch lại để lấy trạng thái cũ từ server
      await refetch({
        searchCondition: { is_deleted: false },
        pageInfo: { pageNum: currentPage, pageSize: itemsPerPage },
      });
    });
  };

  const handleRestoreClick = (productId: string, productName: string) => {
    setRestoreModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const handleRestoreConfirm = () => {
    // Prevent double clicks
    if (isRestoring) return;

    // Call API to restore product
    restoreProductAPI(restoreModal.productId, async () => {
      // onSuccess: Close modal and refresh data
      setRestoreModal({ isOpen: false, productId: "", productName: "" });

      // Refresh product list to show restored products
      await refetch({
        searchCondition: { is_deleted: true },
        pageInfo: { pageNum: currentPage, pageSize: itemsPerPage },
      });
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative" }}>
        {/* Top Header & Breadcrumbs */}
        <header style={{ width: "100%", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0, zIndex: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6c757d" }}>
              <a href="#" style={{ color: "#6c757d", textDecoration: "none", transition: "color 0.2s" }}>
                Home
              </a>
              <span style={{ fontSize: "16px" }}>›</span>
              <span style={{ color: "#212529", fontWeight: "500" }}>Products</span>
            </nav>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.025em", color: "#212529", margin: 0 }}>
                Product Management
              </h2>
              <p style={{ color: "#6c757d", margin: 0 }}>
                Total Products: {isLoading ? "..." : products.length}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/products/create')}
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
                fontSize: "14px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
              <span>Create Product</span>
            </button>
          </div>
        </header>

        {/* Content Area - No Scroll */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 32px 32px", overflow: "hidden" }}>
          {/* Filters & Toolbar - Fixed */}
          <div style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            marginBottom: "24px",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                {/* Show Deleted Toggle */}
                {/* <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: showDeleted ? "#fff3e0" : "white",
                    color: showDeleted ? "#f57c00" : "#6c757d",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = showDeleted ? "#f57c00" : "#bdbdbd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", marginRight: "4px", verticalAlign: "middle" }}>delete_outline</span>
                  {showDeleted ? "Xem sản phẩm đã xóa" : "Xem tất cả"}
                </button> */}

                {/* Search */}
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "12px",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#6c757d"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or product ID..."
                    style={{
                      display: "block",
                      width: "100%",
                      borderRadius: "8px",
                      border: "0",
                      padding: "10px 16px 10px 40px",
                      color: "#212529",
                      backgroundColor: "#f8f9fa",
                      outline: "none",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Status Filter Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
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
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#bdbdbd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setShowDeleted(false);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                  color: "#6c757d",
                  fontWeight: "500",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
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
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table Container - Scrollable */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            overflow: "hidden"
          }}>
            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    <th style={{
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Product ID
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Product
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Category
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Price
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Stock Status
                    </th>

                    <th style={{
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      textAlign: "center"
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: "1px solid #e9ecef" }}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>
                        <span>Đang tải...</span>
                      </td>
                    </tr>
                  ) : currentProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>
                        <span>Không tìm thấy sản phẩm</span>
                      </td>
                    </tr>
                  ) : (
                    currentProducts.map((product) => (
                      <tr
                        key={product.id}
                        style={{
                          transition: "background-color 0.2s",
                          borderBottom: "1px solid #f8f9fa"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#495057"
                        }}>
                          {product.id}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                objectFit: "cover"
                              }}
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#212529"
                              }}>
                                {product.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: "#f5e6d3",
                            color: "#8B4513"
                          }}>
                            {product.SKU}
                          </span>
                        </td>
                        <td style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#212529"
                        }}>
                          {formatPrice(product.min_price)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <label style={{
                            position: "relative",
                            display: "inline-block",
                            width: "44px",
                            height: "24px",
                            cursor: "pointer"
                          }}>
                            <input
                              type="checkbox"
                              checked={product.is_active}
                              onChange={() => handleToggleStatus(product.id, product.is_active)}
                              style={{
                                opacity: 0,
                                width: 0,
                                height: 0
                              }}
                            />
                            <span style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: product.is_active ? "#8B4513" : "#ccc",
                              borderRadius: "24px",
                              transition: "background-color 0.3s"
                            }}>
                              <span style={{
                                position: "absolute",
                                content: "",
                                height: "18px",
                                width: "18px",
                                left: product.is_active ? "23px" : "3px",
                                bottom: "3px",
                                backgroundColor: "white",
                                borderRadius: "50%",
                                transition: "left 0.3s"
                              }} />
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}>
                            {/* View Details Button */}
                            <button
                              onClick={async () => {
                                setDetailsModal({ isOpen: true, productId: product.id });
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
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(51, 102, 204, 0.05)";
                                e.currentTarget.style.color = "#3366cc";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                              title="View Details"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>visibility</span>
                            </button>

                            {/* Edit Button */}
                            {showDeleted ? (
                              <button
                                onClick={() => handleRestoreClick(product.id, product.name)}
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
                                  cursor: isRestoring ? "not-allowed" : "pointer",
                                  transition: "all 0.2s",
                                  opacity: isRestoring ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (!isRestoring) {
                                    e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.05)";
                                    e.currentTarget.style.color = "#4caf50";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>restore</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteClick(product.id, product.name)}
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
                                  cursor: isDeleting ? "not-allowed" : "pointer",
                                  transition: "all 0.2s",
                                  opacity: isDeleting ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (!isDeleting) {
                                    e.currentTarget.style.backgroundColor = "#fee";
                                    e.currentTarget.style.color = "#ef4444";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
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
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #e9ecef",
              backgroundColor: "#f8f9fa",
              padding: "12px 24px",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>
                    Showing <span style={{ fontWeight: "500" }}>{startIndex + 1}</span> to{" "}
                    <span style={{ fontWeight: "500" }}>
                      {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                    </span>{" "}
                    of <span style={{ fontWeight: "500" }}>{filteredProducts.length}</span> results
                  </p>
                </div>
                <div>
                  <nav aria-label="Pagination" style={{ display: "inline-flex" }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                        transition: "all 0.2s"
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
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
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
                            fontWeight: currentPage === pageNum ? "600" : "500",
                            color: currentPage === pageNum ? "white" : "#374151",
                            backgroundColor: currentPage === pageNum ? "#8B4513" : "white",
                            border: "1px solid",
                            borderColor: currentPage === pageNum ? "#8B4513" : "#e5e7eb",
                            borderRight: "none",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== pageNum) {
                              e.currentTarget.style.backgroundColor = "#f9fafb";
                              e.currentTarget.style.borderColor = "#d1d5db";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== pageNum) {
                              e.currentTarget.style.backgroundColor = "white";
                              e.currentTarget.style.borderColor = "#e5e7eb";
                            } else {
                              e.currentTarget.style.backgroundColor = "#8B4513";
                              e.currentTarget.style.borderColor = "#8B4513";
                            }
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: currentPage === totalPages ? "#9ca3af" : "#374151",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderTopRightRadius: "6px",
                        borderBottomRightRadius: "6px",
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      <ProductDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: "", productName: "" })}
        onConfirm={handleDeleteConfirm}
        productName={deleteModal.productName}
        productId={deleteModal.productId}
      />

      {/* Restore Modal */}
      <ProductRestore
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, productId: "", productName: "" })}
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
