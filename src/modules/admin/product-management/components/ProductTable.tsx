import { mockProducts, mockCategories } from "@/mock/data/products.mock";
import { mockFranchises } from "@/mock/data/franchises.mock";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductAction from "./ProductAction";

export default function ProductTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: "",
    productName: ""
  });
  const [productStatus, setProductStatus] = useState<Record<string, boolean>>(
    mockProducts.reduce((acc, product) => ({
      ...acc,
      [product.id]: product.stock > 0
    }), {})
  );
  const itemsPerPage = 10;

  const filteredProducts = mockProducts.filter(product => {
    // Filter by search term (name or ID)
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter;
    
    // Filter by franchise
    const matchesFranchise = franchiseFilter === "all" || 
      (product.franchiseIds?.includes(parseInt(franchiseFilter)) ?? false);
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "in-stock" && product.stock > 0) ||
      (statusFilter === "out-of-stock" && product.stock === 0);
    
    return matchesSearch && matchesCategory && matchesFranchise && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      "Điện thoại": "#ff9800",
      "Laptop": "#2196f3",
      "Phụ kiện": "#9c27b0",
    };
    return colors[categoryName] || "#757575";
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setFranchiseFilter("all");
    setStatusFilter("all");
  };

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const handleDeleteConfirm = () => {
    console.log("Delete product:", deleteModal.productId);
    alert(`Product "${deleteModal.productName}" has been deleted successfully!`);
    // Here you would typically call an API to delete the product
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
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
              <p style={{ color: "#6c757d", margin: 0 }}>Total Products: {mockProducts.length}</p>
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

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 32px" }}>
          {/* Filters & Toolbar */}
          <div style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            marginBottom: "24px",
            position: "sticky",
            top: 0,
            zIndex: 20
          }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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

              {/* Filters Group */}
              <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                {/* Category Filter */}
                <div style={{ position: "relative", minWidth: "140px" }}>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      display: "block",
                      width: "100%",
                      appearance: "none",
                      borderRadius: "8px",
                      border: "0",
                      padding: "10px 40px 10px 12px",
                      color: "#212529",
                      backgroundColor: "#f8f9fa",
                      outline: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="all">All Categories</option>
                    {mockCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <div style={{
                    pointerEvents: "none",
                    position: "absolute",
                    top: "50%",
                    right: "12px",
                    transform: "translateY(-50%)",
                    color: "#6c757d"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Franchise Filter */}
                <div style={{ position: "relative", minWidth: "140px" }}>
                  <select
                    value={franchiseFilter}
                    onChange={(e) => setFranchiseFilter(e.target.value)}
                    style={{
                      display: "block",
                      width: "100%",
                      appearance: "none",
                      borderRadius: "8px",
                      border: "0",
                      padding: "10px 40px 10px 12px",
                      color: "#212529",
                      backgroundColor: "#f8f9fa",
                      outline: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="all">All Franchises</option>
                    {mockFranchises.filter(f => f.is_active && !f.is_deleted).map((franchise) => (
                      <option key={franchise.id} value={franchise.id}>{franchise.name}</option>
                    ))}
                  </select>
                  <div style={{
                    pointerEvents: "none",
                    position: "absolute",
                    top: "50%",
                    right: "12px",
                    transform: "translateY(-50%)",
                    color: "#6c757d"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <div style={{ position: "relative", minWidth: "140px" }}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      display: "block",
                      width: "100%",
                      appearance: "none",
                      borderRadius: "8px",
                      border: "0",
                      padding: "10px 40px 10px 12px",
                      color: "#212529",
                      backgroundColor: "#f8f9fa",
                      outline: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                  <div style={{
                    pointerEvents: "none",
                    position: "absolute",
                    top: "50%",
                    right: "12px",
                    transform: "translateY(-50%)",
                    color: "#6c757d"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                <button
                  onClick={handleClearFilters}
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#8B4513",
                    padding: "0 8px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: "transparent",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#6d3610"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#8B4513"}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            overflow: "hidden"
          }}>
            <div style={{ overflowX: "auto" }}>
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
                      letterSpacing: "0.5px"
                    }}>
                      Franchises
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
                  {currentProducts.map((product) => {
                    const productFranchises = mockFranchises.filter(f => 
                      (product.franchiseIds?.includes(f.id) ?? false) && f.is_active && !f.is_deleted
                    );
                    
                    return (
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
                              src={product.images?.[0]}
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
                            backgroundColor: getCategoryColor(product.category.name) + "15",
                            color: getCategoryColor(product.category.name)
                          }}>
                            {product.category.name}
                          </span>
                        </td>
                        <td style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#212529"
                        }}>
                          ${(product.price / 1000).toFixed(2)}
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
                              checked={productStatus[product.id]}
                              onChange={() => setProductStatus(prev => ({
                                ...prev,
                                [product.id]: !prev[product.id]
                              }))}
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
                              backgroundColor: productStatus[product.id] ? "#8B4513" : "#ccc",
                              borderRadius: "24px",
                              transition: "background-color 0.3s"
                            }}>
                              <span style={{
                                position: "absolute",
                                content: "",
                                height: "18px",
                                width: "18px",
                                left: productStatus[product.id] ? "23px" : "3px",
                                bottom: "3px",
                                backgroundColor: "white",
                                borderRadius: "50%",
                                transition: "left 0.3s"
                              }} />
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {productFranchises.length > 0 ? (
                              productFranchises.map((franchise) => (
                                <span
                                  key={franchise.id}
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "500",
                                    backgroundColor: "#e7f3ff",
                                    color: "#0066cc"
                                  }}
                                >
                                  {franchise.name}
                                </span>
                              ))
                            ) : (
                              <span style={{
                                fontSize: "13px",
                                color: "#6c757d",
                                fontStyle: "italic"
                              }}>
                                No franchises
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}>
                            <button
                              onClick={() => navigate(`/admin/products/edit/${product.id}`)}
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
                                e.currentTarget.style.backgroundColor = "rgba(25, 127, 230, 0.05)";
                                e.currentTarget.style.color = "#197fe6";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit_square</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product.id, product.name)}
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
                                e.currentTarget.style.backgroundColor = "#fee";
                                e.currentTarget.style.color = "#ef4444";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #e9ecef",
              backgroundColor: "#f8f9fa",
              padding: "12px 24px"
            }}>
              <div style={{ display: "none", flex: 1, alignItems: "center", justifyContent: "space-between" }} className="sm:flex sm:flex-1 sm:items-center sm:justify-between">
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
                  <nav aria-label="Pagination" style={{ display: "inline-flex", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "8px 12px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderTopLeftRadius: "6px",
                        borderBottomLeftRadius: "6px",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.5 : 1,
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => currentPage !== 1 && (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            position: "relative",
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: currentPage === pageNum ? "600" : "500",
                            color: currentPage === pageNum ? "white" : "#374151",
                            backgroundColor: currentPage === pageNum ? "#197fe6" : "white",
                            border: "1px solid #e5e7eb",
                            borderLeft: "none",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                          }}
                          onMouseEnter={(e) => currentPage !== pageNum && (e.currentTarget.style.backgroundColor = "#f9fafb")}
                          onMouseLeave={(e) => currentPage !== pageNum && (e.currentTarget.style.backgroundColor = "white")}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "8px 12px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderLeft: "none",
                        borderTopRightRadius: "6px",
                        borderBottomRightRadius: "6px",
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => currentPage !== totalPages && (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
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
      <ProductAction
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: "", productName: "" })}
        onConfirm={handleDeleteConfirm}
        productName={deleteModal.productName}
        productId={deleteModal.productId}
      />
    </div>
  );
}
