import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGetInventories } from "./hooks/useGetInventories";
import { useDeleteInventory } from "./hooks/useDeleteInventory";
import { useRestoreInventory } from "./hooks/useRestoreInventory";
import { useAdjustInventory } from "./hooks/useAdjustInventory";
import { useGetInventoryLogs } from "./hooks/useGetInventoryLogs";
import type { InventoryItem, InventorySearchPayload } from "./inventory.types";
import InventoryDelete from "./InventoryDelete";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; inventoryId: string; productName: string }>({
    isOpen: false,
    inventoryId: "",
    productName: ""
  });
  const [adjustPopover, setAdjustPopover] = useState<{ open: boolean; item: InventoryItem | null }>({
    open: false, item: null
  });
  const [popoverIncrease, setPopoverIncrease] = useState("");
  const [popoverDecrease, setPopoverDecrease] = useState("");
  const [popoverReason, setPopoverReason] = useState("");
  const [logsModal, setLogsModal] = useState<{ open: boolean; inventoryId: string; productName: string }>({
    open: false, inventoryId: "", productName: ""
  });
  const [restoreModal, setRestoreModal] = useState<{ open: boolean; inventoryId: string; productName: string }>({
    open: false, inventoryId: "", productName: ""
  });

  const [inputValue, setInputValue] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 7;

  const { inventories, isLoading, totalItems, totalPages, refetch } = useGetInventories();
  const { deleteInventory, isDeleting } = useDeleteInventory();
  const { restoreInventory, isRestoring } = useRestoreInventory();
  const { adjustInventory, isAdjusting } = useAdjustInventory();
  const { logs, isLoading: isLogsLoading, fetchLogs } = useGetInventoryLogs();

  const buildPayload = (page: number): InventorySearchPayload => ({
    searchCondition: { is_deleted: showDeleted },
    pageInfo: { pageNum: page, pageSize: itemsPerPage },
  });

  useEffect(() => {
    refetch(buildPayload(currentPage));
  }, [currentPage, showDeleted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Client-side filter by search term and status
  const filteredInventory = inventories.filter(item => {
    const productName = item.product_name ?? "";
    const matchesSearch =
      searchTerm === "" ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFranchise =
      franchiseFilter === "" ||
      (item.franchise_name ?? item.franchise_id) === franchiseFilter;

    const stockStatus = getStockStatus(item.quantity, item.alert_threshold);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-stock" && stockStatus.label === "In Stock") ||
      (statusFilter === "low-stock" && stockStatus.label === "Low Stock") ||
      (statusFilter === "out-of-stock" && stockStatus.label === "Out of Stock");

    return matchesSearch && matchesStatus && matchesFranchise;
  });

  // Unique franchise names from loaded inventory for dropdown
  const franchiseOptions = Array.from(
    new Map(inventories.map(i => [i.franchise_id, i.franchise_name ?? i.franchise_id])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const sortedInventory = filteredInventory;

  const handleClearFilters = () => {
    setInputValue("");
    setSearchTerm("");
    setStatusFilter("all");
    setFranchiseFilter("");
    setShowDeleted(false);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearchTerm(inputValue);
    setCurrentPage(1);
  };

  const handleOpenAdjust = (_e: React.MouseEvent<HTMLButtonElement>, item: InventoryItem) => {
    setAdjustPopover({ open: true, item });
    setPopoverIncrease("");
    setPopoverDecrease("");
    setPopoverReason("");
  };

  const handleAdjustSubmit = () => {
    if (!adjustPopover.item) return;
    const change = (Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0);
    if (change === 0) return;
    adjustInventory(
      { product_franchise_id: adjustPopover.item.product_franchise_id, change, reason: popoverReason.trim() || "Điều chỉnh số lượng" },
      () => {
        setAdjustPopover({ open: false, item: null });
        refetch(buildPayload(currentPage));
      }
    );
  };

  const handleViewLogs = (inventoryId: string, productName: string) => {
    setLogsModal({ open: true, inventoryId, productName });
    fetchLogs(inventoryId);
  };

  const handleDelete = (inventoryId: string, productName: string) => {
    setDeleteModal({ isOpen: true, inventoryId, productName });
  };

  const handleDeleteConfirm = () => {
    deleteInventory(deleteModal.inventoryId, () => {
      setDeleteModal({ isOpen: false, inventoryId: "", productName: "" });
      refetch(buildPayload(currentPage));
    });
  };

  const handleRestore = (inventoryId: string, productName: string) => {
    setRestoreModal({ open: true, inventoryId, productName });
  };

  const handleRestoreConfirm = () => {
    restoreInventory(restoreModal.inventoryId, () => {
      setRestoreModal({ open: false, inventoryId: "", productName: "" });
      refetch(buildPayload(currentPage));
    });
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
              <p style={{ color: "#6c757d", margin: 0 }}>Total Items: {totalItems}</p>
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

        {/* Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 32px 32px", gap: "16px", minHeight: 0 }}>
          {/* Filters */}
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", flexShrink: 0, zIndex: 20 }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {/* Search input */}
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none", color: "#6c757d" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Tìm kiếm theo tên, mã sản phẩm... (Ctrl+k)"
                  style={{ display: "block", width: "100%", borderRadius: "8px", border: "0", padding: "10px 16px 10px 40px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#8B4513", color: "white", padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", transition: "background-color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Tìm kiếm
              </button>

              {/* Status Filter */}
              <div style={{ position: "relative", minWidth: "165px" }}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ display: "block", width: "100%", appearance: "none", borderRadius: "8px", border: "0", padding: "10px 40px 10px 12px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
                <div style={{ pointerEvents: "none", position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", color: "#6c757d" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              {/* Filter by Franchise */}
              <div style={{ position: "relative", minWidth: "175px" }}>
                <select value={franchiseFilter} onChange={(e) => { setFranchiseFilter(e.target.value); setCurrentPage(1); }} style={{ display: "block", width: "100%", appearance: "none", borderRadius: "8px", border: "0", padding: "10px 40px 10px 12px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="">Sort by Franchise</option>
                  {franchiseOptions.map(([id, name]) => (
                    <option key={id} value={name}>{name}</option>
                  ))}
                </select>
                <div style={{ pointerEvents: "none", position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", color: "#6c757d" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              {/* Toggle current / deleted */}
              <button
                onClick={() => { setShowDeleted(d => !d); setCurrentPage(1); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", border: showDeleted ? "1px solid #dc3545" : "1px solid #e0e0e0", fontWeight: "500", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", backgroundColor: showDeleted ? "#fff5f5" : "white", color: showDeleted ? "#dc3545" : "#374151", transition: "all 0.2s" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                {showDeleted ? "Đã xóa" : "Hiện tại"}
              </button>

              {/* Clear filters */}
              <button onClick={handleClearFilters} style={{ fontSize: "14px", fontWeight: "500", color: "#8B4513", padding: "10px 8px", whiteSpace: "nowrap", cursor: "pointer", border: "none", backgroundColor: "transparent", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#6d3610"} onMouseLeave={(e) => e.currentTarget.style.color = "#8B4513"}>
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center", flexShrink: 0 }}>
              <p style={{ color: "#6c757d", fontSize: "16px" }}>Loading...</p>
            </div>
          ) : sortedInventory.length > 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", overflow: "hidden", minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
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
                  {sortedInventory.map((item) => {
                    const stockStatus = getStockStatus(item.quantity, item.alert_threshold);
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #e9ecef", transition: "background-color 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>
                          #{item.id.slice(-6)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                            {item.product_name ?? item.product_id}
                          </span>
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>
                          {item.franchise_name ?? item.franchise_id}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: item.quantity <= item.alert_threshold ? "#dc3545" : "#212529" }}>{item.quantity}</span>
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#6c757d" }}>
                          {item.alert_threshold}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "12px", backgroundColor: stockStatus.label === "In Stock" ? "#d4edda" : stockStatus.label === "Low Stock" ? "#fff3cd" : "#f8d7da", color: stockStatus.color }}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            {showDeleted ? (
                              <button title="Khôi phục" onClick={() => handleRestore(item.id, item.product_name ?? item.product_id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e8f5e9"; e.currentTarget.style.color = "#28a745"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>restore</span>
                              </button>
                            ) : (
                              <>
                                {/* Adjust quantity */}
                                <button title="Điều chỉnh số lượng" onClick={(e) => handleOpenAdjust(e, item)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139,69,19,0.07)"; e.currentTarget.style.color = "#8B4513"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>tune</span>
                                </button>
                                {/* View logs */}
                                <button title="Xem lịch sử" onClick={() => handleViewLogs(item.id, item.product_name ?? item.product_id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(25,127,230,0.07)"; e.currentTarget.style.color = "#197fe6"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>history</span>
                                </button>
                                {/* Delete */}
                                <button title="Xóa" onClick={() => handleDelete(item.id, item.product_name ?? item.product_id)} disabled={isDeleting} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: isDeleting ? "not-allowed" : "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { if (!isDeleting) { e.currentTarget.style.backgroundColor = "#fee"; e.currentTarget.style.color = "#ef4444"; } }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                                </button>
                              </>
                            )}
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
                    Page {currentPage} of {totalPages} — {totalItems} results
                  </p>
                </div>
                <div>
                  <nav aria-label="Pagination" style={{ display: "inline-flex", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === 1 ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderRadius: "6px 0 0 6px", cursor: currentPage === 1 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: page === currentPage ? "white" : "#495057", backgroundColor: page === currentPage ? "#8B4513" : "white", border: "1px solid #dee2e6", borderLeft: "none", cursor: "pointer", transition: "all 0.2s" }}>{page}</button>
                    ))}
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === totalPages ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderLeft: "none", borderRadius: "0 6px 6px 0", cursor: currentPage === totalPages ? "not-allowed" : "pointer", transition: "all 0.2s" }}>Next</button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>📦</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#212529" }}>
                No Inventory Items
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
                No inventory items found. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Adjust Quantity Modal */}
      {adjustPopover.open && adjustPopover.item && (
        <div onClick={() => setAdjustPopover({ open: false, item: null })} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.18)", width: "90%", maxWidth: "400px", padding: "0", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#212529" }}>Điều chỉnh số lượng</h3>
              <button onClick={() => setAdjustPopover({ open: false, item: null })} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", fontSize: "20px", lineHeight: 1, padding: "0 2px" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Product info */}
            <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
              <span style={{ fontWeight: "600", color: "#212529" }}>{adjustPopover.item.product_name ?? adjustPopover.item.product_id}</span><br />
              <span style={{ color: "#6c757d" }}>Hiện tại: </span>
              <strong style={{ color: "#212529" }}>{adjustPopover.item.quantity}</strong>
              <span style={{ color: "#6c757d" }}> · Ngưỡng: {adjustPopover.item.alert_threshold}</span>
            </div>
            {/* Inputs */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#28a745", marginBottom: "6px" }}>▲ Tăng</label>
                <input type="number" min="0" value={popoverIncrease} onChange={(e) => setPopoverIncrease(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `2px solid ${popoverIncrease ? "#28a745" : "#dee2e6"}`, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#dc3545", marginBottom: "6px" }}>▼ Giảm</label>
                <input type="number" min="0" value={popoverDecrease} onChange={(e) => setPopoverDecrease(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `2px solid ${popoverDecrease ? "#dc3545" : "#dee2e6"}`, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            {/* Preview result */}
            {(popoverIncrease !== "" || popoverDecrease !== "") && (() => {
              const change = (Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0);
              const newQty = adjustPopover.item!.quantity + change;
              return (
                <div style={{ borderRadius: "8px", padding: "12px 14px", fontSize: "14px", fontWeight: "600", backgroundColor: change > 0 ? "#d4edda" : change < 0 ? "#f8d7da" : "#e2e3e5", color: change > 0 ? "#155724" : change < 0 ? "#721c24" : "#383d41" }}>
                  Số lượng sau điều chỉnh: <strong>{adjustPopover.item!.quantity}</strong> → <strong style={{ fontSize: "16px" }}>{newQty}</strong>
                  <span style={{ fontWeight: "400", marginLeft: "6px", fontSize: "13px" }}>({change > 0 ? "+" : ""}{change})</span>
                </div>
              );
            })()}
            {/* Reason */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>Lý do</label>
              <input type="text" value={popoverReason} onChange={(e) => setPopoverReason(e.target.value)} placeholder="Nhập lý do điều chỉnh..." style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dee2e6", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            </div>
            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setAdjustPopover({ open: false, item: null })} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #dee2e6", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}>Hủy</button>
              <button
                disabled={isAdjusting || (popoverIncrease === "" && popoverDecrease === "") || ((Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0) === 0)}
                onClick={handleAdjustSubmit}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#8B4513", color: "white", cursor: isAdjusting ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600", opacity: isAdjusting ? 0.7 : 1 }}
              >
                {isAdjusting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {logsModal.open && (
        <div onClick={() => setLogsModal({ open: false, inventoryId: "", productName: "" })} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", width: "90%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: "700" }}>Lịch sử điều chỉnh</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>{logsModal.productName}</p>
              </div>
              <button onClick={() => setLogsModal({ open: false, inventoryId: "", productName: "" })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6c757d" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {isLogsLoading ? (
                <p style={{ color: "#6c757d", textAlign: "center", margin: 0 }}>Đang tải lịch sử...</p>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: "40px", opacity: 0.3, marginBottom: "12px" }}>📋</div>
                  <p style={{ color: "#6c757d", margin: 0 }}>Chưa có lịch sử điều chỉnh</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {logs.map((log) => (
                    <div key={log._id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: log.change > 0 ? "#d4edda" : "#f8d7da", color: log.change > 0 ? "#28a745" : "#dc3545", fontWeight: "700", fontSize: "13px" }}>
                        {log.change > 0 ? "▲" : "▼"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: log.change > 0 ? "#28a745" : "#dc3545" }}>
                            {log.change > 0 ? "+" : ""}{log.change}
                          </span>
                          <span style={{ fontSize: "12px", color: "#6c757d" }}>{new Date(log.created_at).toLocaleString("vi-VN")}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>{log.type} · {log.reference_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <InventoryDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, inventoryId: "", productName: "" })}
        onConfirm={handleDeleteConfirm}
        inventoryId={deleteModal.inventoryId}
        productName={deleteModal.productName}
      />

      {/* Restore Confirmation Modal */}
      {restoreModal.open && (
        <div
          onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "white", borderRadius: "12px", width: "90%", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ backgroundColor: "#d4edda", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#28a745" }}>restore</span>
                </div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#212529" }}>Khôi phục Inventory</h2>
              </div>
              <button
                onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })}
                style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#6c757d" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: "24px" }}>
              <p style={{ margin: "0 0 16px", fontSize: "15px", color: "#495057", lineHeight: "1.6" }}>
                Bạn có chắc chắn muốn khôi phục inventory item này không? Item sẽ được đưa trở lại danh sách hoạt động.
              </p>
              <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Inventory ID</span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>#{restoreModal.inventoryId.slice(-6)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Sản phẩm</span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>{restoreModal.productName}</p>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })}
                disabled={isRestoring}
                style={{ padding: "10px 20px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", backgroundColor: "white", color: "#374151" }}
              >
                Hủy
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={isRestoring}
                style={{ padding: "10px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: isRestoring ? "not-allowed" : "pointer", backgroundColor: "#28a745", color: "white", opacity: isRestoring ? 0.7 : 1, display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{isRestoring ? "sync" : "restore"}</span>
                {isRestoring ? "Đang khôi phục..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
