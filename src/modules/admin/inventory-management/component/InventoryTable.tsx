import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockProducts,
  mockFranchises,
} from "../../../../mockdata";
import inventory from "../../../../mockdata/inventory.json";
import productFranchise from "../../../../mockdata/product_franchise.json";
import InventoryDelete from "./InventoryDelete";

// Helper functions to work with normalized data
const getProductName = (productFranchiseId: number) => {
  const pf = productFranchise.find(pf => pf.id === productFranchiseId);
  if (!pf) return "Unknown Product";
  const product = mockProducts.find(p => p.id === pf.product_id);
  return product?.name || "Unknown Product";
};

const getFranchiseName = (productFranchiseId: number) => {
  const pf = productFranchise.find(pf => pf.id === productFranchiseId);
  if (!pf) return "Unknown Franchise";
  const franchise = mockFranchises.find(f => f.id === pf.franchise_id);
  return franchise?.name || "Unknown Franchise";
};

const getProductSKU = (productFranchiseId: number) => {
  const pf = productFranchise.find(pf => pf.id === productFranchiseId);
  if (!pf) return "";
  const product = mockProducts.find(p => p.id === pf.product_id);
  return product?.SKU || "";
};

const getStockStatus = (quantity: number, alertThreshold: number) => {
  if (quantity === 0) {
    return { label: "Out of Stock", color: "#dc3545" };
  } else if (quantity <= alertThreshold) {
    return { label: "Low Stock", color: "#ffc107" };
  } else {
    return { label: "In Stock", color: "#28a745" };
  }
};

export default function InventoryTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFranchise, setSelectedFranchise] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [inventoryStatus, setInventoryStatus] = useState<Record<number, boolean>>(
    inventory.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.is_active
    }), {})
  );
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; inventoryId: number; productName: string }>({
    isOpen: false,
    inventoryId: 0,
    productName: ""
  });
  const itemsPerPage = 5;

  const filteredInventory = inventory.filter(item => {
    if (!item.is_active || item.is_deleted) return false;

    // Filter by selected franchise (must select a franchise to see data)
    const pf = productFranchise.find(pf => pf.id === item.product_franchise_id);
    if (selectedFranchise === null || pf?.franchise_id !== selectedFranchise) {
      return false;
    }

    // Filter by search term (product name or SKU)
    const productName = getProductName(item.product_franchise_id);
    const productSKU = getProductSKU(item.product_franchise_id);
    const matchesSearch = searchTerm === "" || 
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productSKU.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const stockStatus = getStockStatus(item.quantity, item.alert_threshold);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "in-stock" && stockStatus.label === "In Stock") ||
      (statusFilter === "low-stock" && stockStatus.label === "Low Stock") ||
      (statusFilter === "out-of-stock" && stockStatus.label === "Out of Stock");
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const handleEdit = (inventoryId: number) => {
    navigate(`/admin/inventory/edit/${inventoryId}`);
  };

  const handleDelete = (inventoryId: number) => {
    const item = inventory.find(i => i.id === inventoryId);
    const productName = item ? getProductName(item.product_franchise_id) : "Unknown Product";
    setDeleteModal({
      isOpen: true,
      inventoryId,
      productName
    });
  };

  const handleDeleteConfirm = () => {
    console.log("Delete inventory:", deleteModal.inventoryId);
    alert(`Inventory item #${deleteModal.inventoryId} has been deleted successfully!`);
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
              <span style={{ color: "#212529", fontWeight: "500" }}>Inventory</span>
            </nav>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.025em", color: "#212529", margin: 0 }}>
                Inventory Management
              </h2>
              <p style={{ color: "#6c757d", margin: 0 }}>Total Items: {inventory.filter(i => i.is_active && !i.is_deleted).length}</p>
            </div>
            <button
              onClick={() => navigate('/admin/inventory/create')}
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
              <span>Add Inventory</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 32px" }}>
          {/* Filters & Franchise Selector */}
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", marginBottom: "20px", position: "sticky", top: 0, zIndex: 20 }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              {/* Search */}
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none", color: "#6c757d" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by product name or SKU..." style={{ display: "block", width: "100%", borderRadius: "8px", border: "0", padding: "10px 16px 10px 40px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
              </div>

              {/* Status Filter */}
              <div style={{ position: "relative", minWidth: "140px" }}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ display: "block", width: "100%", appearance: "none", borderRadius: "8px", border: "0", padding: "10px 40px 10px 12px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="all">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
                <div style={{ pointerEvents: "none", position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", color: "#6c757d" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              <button onClick={handleClearFilters} style={{ fontSize: "14px", fontWeight: "500", color: "#8B4513", padding: "0 8px", whiteSpace: "nowrap", cursor: "pointer", border: "none", backgroundColor: "transparent", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#6d3610"} onMouseLeave={(e) => e.currentTarget.style.color = "#8B4513"}>
                Clear Filters
              </button>
            </div>

            {/* Franchise Buttons - Below Search */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {mockFranchises.filter(f => f.is_active && !f.is_deleted).map((franchise) => (
                <button key={franchise.id} onClick={() => { setSelectedFranchise(franchise.id); setCurrentPage(1); }} style={{ padding: "6px 14px", borderRadius: "6px", border: selectedFranchise === franchise.id ? "2px solid #8B4513" : "1px solid #e9ecef", backgroundColor: selectedFranchise === franchise.id ? "#8B4513" : "white", color: selectedFranchise === franchise.id ? "white" : "#495057", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { if (selectedFranchise !== franchise.id) { e.currentTarget.style.borderColor = "#8B4513"; e.currentTarget.style.backgroundColor = "#f8f5f0"; } }} onMouseLeave={(e) => { if (selectedFranchise !== franchise.id) { e.currentTarget.style.borderColor = "#e9ecef"; e.currentTarget.style.backgroundColor = "white"; } }}>
                  {franchise.name}
                </button>
              ))}
            </div>
          </div>

          {/* Show table only when franchise is selected */}
          {selectedFranchise && (
            <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>ID</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Product</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Franchise</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantity</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Alert Threshold</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: "1px solid #e9ecef" }}>
                  {currentInventory.map((item) => {
                    const productName = getProductName(item.product_franchise_id);
                    const productSKU = getProductSKU(item.product_franchise_id);
                    const franchiseName = getFranchiseName(item.product_franchise_id);

                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #e9ecef", transition: "background-color 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>
                          #{item.id}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                              {productName}
                            </span>
                            <span style={{ fontSize: "12px", color: "#6c757d" }}>
                              SKU: {productSKU}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>
                          {franchiseName}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: item.quantity <= item.alert_threshold ? "#dc3545" : "#212529" }}>{item.quantity}</span>
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#6c757d" }}>
                          {item.alert_threshold}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
                            <input type="checkbox" checked={inventoryStatus[item.id]} onChange={() => setInventoryStatus(prev => ({ ...prev, [item.id]: !prev[item.id] }))} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: inventoryStatus[item.id] ? "#8B4513" : "#ccc", borderRadius: "24px", transition: "background-color 0.3s" }}>
                              <span style={{ position: "absolute", content: "", height: "18px", width: "18px", left: inventoryStatus[item.id] ? "23px" : "3px", bottom: "3px", backgroundColor: "white", borderRadius: "50%", transition: "left 0.3s" }} />
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <button onClick={() => handleEdit(item.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(25, 127, 230, 0.05)"; e.currentTarget.style.color = "#197fe6"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit_square</span>
                            </button>
                            <button onClick={() => handleDelete(item.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fee"; e.currentTarget.style.color = "#ef4444"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e9ecef", backgroundColor: "#f8f9fa", padding: "12px 24px" }}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length} results
                  </p>
                </div>
                <div>
                  <nav aria-label="Pagination" style={{ display: "inline-flex", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === 1 ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderRadius: "6px 0 0 6px", cursor: currentPage === 1 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: page === currentPage ? "white" : "#495057", backgroundColor: page === currentPage ? "#8B4513" : "white", border: "1px solid #dee2e6", borderLeft: "none", cursor: "pointer", transition: "all 0.2s" }}>{page}</button>
                    ))}
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === totalPages ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderLeft: "none", borderRadius: "0 6px 6px 0", cursor: currentPage === totalPages ? "not-allowed" : "pointer", transition: "all 0.2s" }}>Next</button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Message when no franchise selected */}
          {!selectedFranchise && (
            <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>📍</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#212529" }}>
                Select a Franchise
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
                Please select a franchise above to view inventory items
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      <InventoryDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, inventoryId: 0, productName: "" })}
        onConfirm={handleDeleteConfirm}
        inventoryId={deleteModal.inventoryId.toString()}
        productName={deleteModal.productName}
      />
    </div>
  );
}
