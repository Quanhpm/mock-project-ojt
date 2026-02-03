import { mockProducts } from "@/mock/data/products.mock";
import { mockFranchises } from "@/mock/data/franchises.mock";
import { Package, AlertTriangle, MapPin, Download, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductFilters from "./ProductFilters";
import ProductAction from "./ProductAction";

export default function ProductTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: "",
    productName: ""
  });
  const itemsPerPage = 10;

  const lowStockCount = mockProducts.filter(p => p.stock < 10).length;
  const activeLocations = 12; // Mock data

  const filteredProducts = mockProducts.filter(product => {
    // Filter by search term (name or ID)
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === "" || product.categoryId === categoryFilter;
    
    // Filter by franchise
    const matchesFranchise = franchiseFilter === "" || 
      (product as any).franchiseIds?.includes(parseInt(franchiseFilter));
    
    return matchesSearch && matchesCategory && matchesFranchise;
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
    <div style={{ 
      backgroundColor: "#f8f9fa", 
      minHeight: "100vh",
      padding: "24px" 
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        marginBottom: "24px" 
      }}>
        <div>
          <h1 style={{ 
            fontSize: "32px", 
            fontWeight: "bold", 
            margin: 0,
            marginBottom: "8px"
          }}>
            Product Management
          </h1>
          <p style={{ 
            color: "#6c757d", 
            margin: 0,
            fontSize: "14px"
          }}>
            Manage and track your coffee shop inventory across all locations.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/products/create')}
          style={{
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
          <Plus size={18} />
          New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "20px",
        marginBottom: "24px" 
      }}>
        <div style={{ 
          backgroundColor: "white", 
          padding: "20px", 
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              backgroundColor: "#fff3e0", 
              padding: "12px", 
              borderRadius: "8px" 
            }}>
              <Package size={24} color="#ff9800" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#6c757d", textTransform: "uppercase" }}>
                Total Products
              </p>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
                {mockProducts.length}
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: "white", 
          padding: "20px", 
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              backgroundColor: "#ffebee", 
              padding: "12px", 
              borderRadius: "8px" 
            }}>
              <AlertTriangle size={24} color="#f44336" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#6c757d", textTransform: "uppercase" }}>
                Low Stock Alert
              </p>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
                {lowStockCount}
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: "white", 
          padding: "20px", 
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              backgroundColor: "#e8f5e9", 
              padding: "12px", 
              borderRadius: "8px" 
            }}>
              <MapPin size={24} color="#4caf50" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#6c757d", textTransform: "uppercase" }}>
                Active Locations
              </p>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
                {activeLocations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryFilter}
        onFranchiseChange={setFranchiseFilter}
        searchValue={searchTerm}
        categoryValue={categoryFilter}
        franchiseValue={franchiseFilter}
      />

      {/* Table */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse" 
        }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ 
                padding: "16px", 
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase"
              }}>
                Product ID
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase"
              }}>
                Product
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase"
              }}>
                Category
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase"
              }}>
                Price
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase"
              }}>
                Status
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase"
              }}>
                Franchise Availability
              </th>
              <th style={{ 
                padding: "16px", 
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase"
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500" }}>
                  {product.id}
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img 
                      src={product.images?.[0]} 
                      alt={product.name}
                      style={{ 
                        width: "48px", 
                        height: "48px", 
                        borderRadius: "8px",
                        objectFit: "cover"
                      }} 
                    />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      {product.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    backgroundColor: getCategoryColor(product.category.name) + "20",
                    color: getCategoryColor(product.category.name),
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    {product.category.name}
                  </span>
                </td>
                <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600" }}>
                  ${(product.price / 1000).toFixed(2)}
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: product.stock > 0 ? "#4caf50" : "#f44336"
                    }} />
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: product.stock > 0 ? "#4caf50" : "#f44336"
                    }}>
                      {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(product as any).franchiseIds?.map((franchiseId: number) => {
                      const franchise = mockFranchises.find(f => f.id === franchiseId);
                      if (!franchise) return null;
                      return (
                        <span key={franchiseId} style={{
                          backgroundColor: "#f5f5f5",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: "#424242"
                        }}>
                          {franchise.name}
                        </span>
                      );
                    }) || (
                      <span style={{ fontSize: "12px", color: "#9e9e9e", fontStyle: "italic" }}>
                        No franchises
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button 
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "6px",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      title="Edit"
                    >
                      <Edit2 size={18} color="#6c757d" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(product.id, product.name)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "6px",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ffebee"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      title="Delete"
                    >
                      <Trash2 size={18} color="#f44336" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ 
          padding: "16px", 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #f0f0f0"
        }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                backgroundColor: "white",
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              ←
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: currentPage === i + 1 ? "#ff9800" : "white",
                  color: currentPage === i + 1 ? "white" : "#212529",
                  fontWeight: currentPage === i + 1 ? "600" : "400"
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                backgroundColor: "white",
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

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
