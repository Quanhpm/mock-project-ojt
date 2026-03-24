import { useState, useEffect } from "react";
import { useGetInventories } from "./hooks/useGetInventories";
import { useRestoreInventory } from "./hooks/useRestoreInventory";
import type { InventorySearchPayload } from "./inventory.types";

const getStockStatus = (quantity: number, alertThreshold: number) => {
  if (quantity === 0) return { label: "Out of Stock", color: "#dc3545" };
  if (quantity <= alertThreshold) return { label: "Low Stock", color: "#ffc107" };
  return { label: "In Stock", color: "#28a745" };
};

const ITEMS_PER_PAGE = 7;

export default function InventoryDeletedTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [restoreModal, setRestoreModal] = useState<{
    open: boolean;
    inventoryId: string;
    productName: string;
  }>({
    open: false,
    inventoryId: "",
    productName: "",
  });

  const { inventories, isLoading, totalItems, totalPages, refetch } = useGetInventories(true);
  const { restoreInventory, isRestoring } = useRestoreInventory();

  const buildPayload = (page: number): InventorySearchPayload => ({
    searchCondition: { is_deleted: true },
    pageInfo: { pageNum: page, pageSize: ITEMS_PER_PAGE },
  });

  useEffect(() => {
    void refetch(buildPayload(currentPage));
  }, [currentPage, refetch]);

  const handleOpenRestore = (inventoryId: string, productName: string) => {
    setRestoreModal({ open: true, inventoryId, productName });
  };

  const handleCloseRestore = () => {
    setRestoreModal({ open: false, inventoryId: "", productName: "" });
  };

  const handleRestoreConfirm = () => {
    restoreInventory(restoreModal.inventoryId, () => {
      handleCloseRestore();
      void refetch(buildPayload(currentPage));
    });
  };

  return (
    <>
      {isLoading ? (
        <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center" }}>
          <p style={{ color: "#6c757d", fontSize: "16px" }}>Loading...</p>
        </div>
      ) : inventories.length > 0 ? (
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
                {inventories.map((item) => {
                  const stockStatus = getStockStatus(item.quantity, item.alert_threshold);

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e9ecef", transition: "background-color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8f9fa"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
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
                        <span style={{ fontSize: "14px", fontWeight: "600", color: item.quantity <= item.alert_threshold ? "#dc3545" : "#212529" }}>
                          {item.quantity}
                        </span>
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <button
                            title="Restore"
                            onClick={() => handleOpenRestore(item.id, item.product_name ?? item.product_id)}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e8f5e9"; e.currentTarget.style.color = "#28a745"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>restore</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e9ecef", backgroundColor: "#f8f9fa", padding: "12px 24px" }}>
            <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>
              Page {currentPage} of {totalPages} - {totalItems} results
            </p>
            <nav aria-label="Pagination" style={{ display: "inline-flex", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === 1 ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderRadius: "6px 0 0 6px", cursor: currentPage === 1 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>Previous</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: page === currentPage ? "white" : "#495057", backgroundColor: page === currentPage ? "#8B4513" : "white", border: "1px solid #dee2e6", borderLeft: "none", cursor: "pointer", transition: "all 0.2s" }}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === totalPages ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderLeft: "none", borderRadius: "0 6px 6px 0", cursor: currentPage === totalPages ? "not-allowed" : "pointer", transition: "all 0.2s" }}>Next</button>
            </nav>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>Trash</div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#212529" }}>
            No deleted inventory items
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
            All inventory items are currently active.
          </p>
        </div>
      )}

      {restoreModal.open && (
        <div
          onClick={handleCloseRestore}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "white", borderRadius: "12px", width: "90%", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", overflow: "hidden" }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ backgroundColor: "#d4edda", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#28a745" }}>restore</span>
                </div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#212529" }}>Restore Inventory</h2>
              </div>
              <button onClick={handleCloseRestore} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#6c757d" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <p style={{ margin: "0 0 16px", fontSize: "15px", color: "#495057", lineHeight: "1.6" }}>
                Are you sure you want to restore this inventory item? It will be returned to the active list.
              </p>
              <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Inventory ID</span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>#{restoreModal.inventoryId.slice(-6)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Product</span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>{restoreModal.productName}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={handleCloseRestore}
                disabled={isRestoring}
                style={{ padding: "10px 20px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", backgroundColor: "white", color: "#374151" }}
              >
                Close
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={isRestoring}
                style={{ padding: "10px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: isRestoring ? "not-allowed" : "pointer", backgroundColor: "#28a745", color: "white", opacity: isRestoring ? 0.7 : 1, display: "flex", alignItems: "center", gap: "6px" }}
              >
                {isRestoring ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px", animation: "spin 1s linear infinite" }}>sync</span>
                    Restoring...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>restore</span>
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
