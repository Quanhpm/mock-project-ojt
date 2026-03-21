import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, RotateCcw, Package } from "lucide-react";
import { useFranchiseSearch } from "../hooks";
import { useToast } from "@/hooks/use-toast.hook";
import FranchiseDetailModal from "./FranchiseDetailModal";
import { useGetFranchiseById } from "./hooks/useGetFranchiseById";
import type { Franchise } from "../../../../types/franchise.types";
import FranchiseDelete from "./FranchiseDelete";
import FranchiseRestore from "./FranchiseRestore";
import { FranchiseSearch } from "./FranchiseSearch";

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: "flex" as const,
    height: "100vh",
    width: "100%",
    overflow: "hidden" as const,
  },
  main: {
    flex: 1,
    display: "flex" as const,
    flexDirection: "column" as const,
    height: "100vh",
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  header: {
    width: "100%",
    padding: "32px 40px",
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "28px",
    flexShrink: 0,
    zIndex: 10,
    backgroundColor: "#ffffff",
  },
  contentArea: {
    flex: 1,
    display: "flex" as const,
    flexDirection: "column" as const,
    padding: "0 40px 40px",
    overflow: "hidden" as const,
  },
  filterContainer: {
    backgroundColor: "white",
    padding: "20px 24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    marginBottom: "20px",
    display: "flex" as const,
    alignItems: "flex-end" as const,
    gap: "16px",
    flexWrap: "wrap" as const,
    border: "1px solid #e5e7eb",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    overflow: "auto" as const,
    position: "relative" as const,
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "15px",
  },
  tableHead: {
    position: "sticky" as const,
    top: 0,
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 10,
  },
  paginationContainer: {
    marginTop: "20px",
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    fontSize: "15px",
    padding: "20px 24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
};

const getButtonStyles = {
  primary: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    backgroundColor: "#8B5A2B",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(139, 90, 43, 0.2)",
    transition: "all 0.2s",
    cursor: "pointer" as const,
    border: "none" as const,
    fontWeight: "700" as const,
    fontSize: "15px",
  },
  pagination: {
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600" as const,
    transition: "all 0.2s",
    cursor: "pointer" as const,
  },
  filterInput: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    backgroundColor: "#f9fafb",
    transition: "border-color 0.2s",
  },
  clearFilter: {
    padding: "10px 16px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#374151",
    cursor: "pointer" as const,
    transition: "all 0.2s",
  },
  actionButton: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "none" as const,
    borderRadius: "8px",
    cursor: "pointer" as const,
    transition: "all 0.2s",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  toggleSwitch: {
    position: "relative" as const,
    display: "inline-flex" as const,
    alignItems: "center" as const,
    cursor: "pointer" as const,
  },
  toggleInput: {
    appearance: "none" as const,
    width: 0,
    height: 0,
    opacity: 0,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FranchiseTable() {
  const navigate = useNavigate();

  const searchState = useFranchiseSearch();
  const {
    franchises,
    isLoading,
    error,
    executeSearch,
    clearFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    deleteFranchise,
    toggleFranchiseStatus,
    restoreFranchise,
  } = searchState;

  useEffect(() => {
    executeSearch();
  }, [currentPage]);

  const [isLoadingDetail, setIsLoadingDetail] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState("");
  const { error: showError } = useToast();

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { franchise: selectedFranchise, isLoading: isLoadingFranchiseDetail, fetchFranchise } = useGetFranchiseById();

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; franchiseId: string | number; franchiseName: string }>({
    isOpen: false,
    franchiseId: "",
    franchiseName: "",
  });

  // Restore Modal State
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    franchiseId: string | number;
    franchiseName: string;
  }>({
    isOpen: false,
    franchiseId: "",
    franchiseName: "",
  });

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Auto-correct currentPage if it exceeds totalPages after deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  const handleViewFranchise = async (id: string | number) => {
    setIsLoadingDetail(String(id));
    try {
      await fetchFranchise(String(id));
      setIsDetailModalOpen(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải chi tiết nhượng quyền";
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoadingDetail(null);
    }
  };

  const renderTableRow = (franchise: Franchise, index: number) => {
    return (
      <tr
        key={franchise.id}
        style={{
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor =
            index % 2 === 0 ? "#ffffff" : "#f9fafb";
        }}
      >
        {/* Name */}
        <td style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundImage: `url('${franchise.logo_url}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f3f4f6",
              }}
            />
            <span style={{ fontWeight: "600", color: "#1f2937" }}>
              {franchise.name}
            </span>
          </div>
        </td>

        {/* Code */}
        <td style={{ padding: "16px 20px", color: "#6b7280" }}>
          {franchise.code}
        </td>

        {/* Address */}
        <td
          style={{
            padding: "16px 20px",
            color: "#6b7280",
            maxWidth: "250px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {franchise.address}
        </td>

        {/* Status */}
        <td style={{ padding: "16px 20px" }}>
          <label
            style={
              {
                ...getButtonStyles.toggleSwitch,
                cursor: isLoading || franchise.is_deleted ? "not-allowed" : "pointer",
              } as React.CSSProperties
            }
          >
            <input
              type="checkbox"
              checked={franchise.is_active}
              onChange={() =>
                !isLoading && !franchise.is_deleted && toggleFranchiseStatus(franchise.id, franchise.is_active)
              }
              style={getButtonStyles.toggleInput as React.CSSProperties}
              disabled={isLoading || franchise.is_deleted}
            />
            <div
              style={{
                width: "44px",
                height: "24px",
                backgroundColor: franchise.is_active ? "#8B5A2B" : "#d1d5db",
                borderRadius: "12px",
                transition: "background-color 0.3s",
                position: "relative",
                opacity: isLoading || franchise.is_deleted ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: franchise.is_active ? "22px" : "2px",
                  width: "20px",
                  height: "20px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: "left 0.3s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </label>
        </td>

        {/* Actions */}
        <td style={{ padding: "16px 20px", textAlign: "right" }}>
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
          >
            <button
              onClick={() => handleViewFranchise(franchise.id)}
              disabled={isLoadingDetail === String(franchise.id)}
              style={
                {
                  ...getButtonStyles.actionButton,
                  color: isLoadingDetail === String(franchise.id) ? "#c0c0c0" : "#4b5563",
                  opacity: isLoadingDetail === String(franchise.id) ? 0.6 : 1,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (isLoadingDetail !== String(franchise.id)) {
                  e.currentTarget.style.backgroundColor = "#e0f2fe";
                  e.currentTarget.style.color = "#0066cc";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color =
                  isLoadingDetail === String(franchise.id) ? "#c0c0c0" : "#4b5563";
              }}
              title={isLoadingDetail === String(franchise.id) ? "Loading..." : "View"}
            >
              <Eye size={20} />
            </button>

            {!franchise.is_deleted && (
              <>
                <button
                  onClick={() => navigate(`/admin/franchises/${franchise.id}/products`)}
                  style={
                    {
                      ...getButtonStyles.actionButton,
                      color: "#4b5563",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ede9fe";
                    e.currentTarget.style.color = "#7c3aed";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }}
                  title="Products"
                >
                  <Package size={20} />
                </button>

                <button
                  onClick={() => navigate(`/admin/franchises/edit/${franchise.id}`)}
                  style={
                    {
                      ...getButtonStyles.actionButton,
                      color: "#4b5563",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef3c7";
                    e.currentTarget.style.color = "#92400e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }}
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>
              </>
            )}

            <button
              onClick={() => {
                if (franchise.is_deleted) {
                  setRestoreModal({
                    isOpen: true,
                    franchiseId: franchise.id,
                    franchiseName: franchise.name
                  });
                } else {
                  setDeleteModal({
                    isOpen: true,
                    franchiseId: franchise.id,
                    franchiseName: franchise.name
                  });
                }
              }}
              style={
                {
                  ...getButtonStyles.actionButton,
                  color: "#4b5563",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (franchise.is_deleted) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.color = "#1f2937";
                } else {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#4b5563";
              }}
              title={franchise.is_deleted ? "Restore" : "Delete"}
            >
              {franchise.is_deleted ? (
                <RotateCcw size={20} />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <header style={styles.header}>
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
                Franchises
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
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: "900",
                  letterSpacing: "-0.025em",
                  color: "#212529",
                  margin: 0,
                }}
              >
                Franchise Management
              </h1>
              <p style={{ color: "#6c757d", margin: 0, fontSize: "15px" }}>
                Total Franchises: {totalItems || 0}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/franchises/create")}
              style={getButtonStyles.primary as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#6d4423";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(139, 90, 43, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B5A2B";
                e.currentTarget.style.boxShadow =
                  "0 2px 4px rgba(139, 90, 43, 0.2)";
              }}
            >
              <span style={{ fontSize: "20px" }}>+</span>
              <span>Create Franchise</span>
            </button>
          </div>
        </header>

        <div style={styles.contentArea}>
          <FranchiseSearch
            searchState={searchState}
            onSearch={executeSearch}
            onClearFilters={() => {
              clearFilters();
              setCurrentPage(1);
            }}
          />

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontWeight: "700",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontWeight: "700",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Code
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontWeight: "700",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Address
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontWeight: "700",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "48px 20px",
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#8B5A2B",
                        }}
                      >
                        Loading franchise data...
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && error && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "48px 20px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          color: "#dc2626",
                        }}
                      >
                        ❌ An error occurred
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          margin: "0",
                          color: "#dc2626",
                        }}
                      >
                        {error}
                      </p>
                    </td>
                  </tr>
                )}

                {!isLoading && !error && franchises?.length > 0 && (
                  <>
                    {franchises.map((franchise, index) =>
                      renderTableRow(franchise, index),
                    )}
                  </>
                )}

                {!isLoading && !error && franchises?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "48px 20px",
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        📭 No data found
                      </div>
                      <p style={{ fontSize: "14px", margin: "0" }}>
                        Try adjusting your filters or create a new franchise
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && totalPages > 0 && (
            <div style={styles.paginationContainer}>
              <span style={{ color: "#6b7280" }}>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{" "}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...getButtonStyles.pagination,
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  } as React.CSSProperties}
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
                      <span key={`e-${idx}`} style={{ padding: "0 6px", color: "#6b7280", fontWeight: "600", lineHeight: "36px" }}>...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          ...getButtonStyles.pagination,
                          backgroundColor: page === currentPage ? "#8B5A2B" : "white",
                          color: page === currentPage ? "white" : "#374151",
                        } as React.CSSProperties}
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
                    ...getButtonStyles.pagination,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  } as React.CSSProperties}
                >
                  Next
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>Go to page</span>
                  <input
                    type="number" min={1} max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const n = Number.parseInt(pageInput, 10);
                        if (!Number.isNaN(n) && n >= 1 && n <= totalPages) setCurrentPage(n);
                        setPageInput("");
                      }
                    }}
                    placeholder={String(currentPage)}
                    style={{ width: "52px", height: "36px", border: "1px solid #e5e7eb", borderRadius: "6px", textAlign: "center", fontSize: "14px", outline: "none", padding: "0 4px" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Franchise Detail Modal */}
      <FranchiseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        franchise={selectedFranchise}
        isLoading={isLoadingFranchiseDetail}
      />

      {/* Delete Franchise Modal */}
      <FranchiseDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => deleteFranchise(deleteModal.franchiseId)}
        franchiseId={deleteModal.franchiseId}
        franchiseName={deleteModal.franchiseName}
      />

      {/* Restore Franchise Modal */}
      <FranchiseRestore
        isOpen={restoreModal.isOpen}
        franchiseId={restoreModal.franchiseId}
        franchiseName={restoreModal.franchiseName}
        isRestoring={isLoading}
        onConfirm={() => {
          restoreFranchise(restoreModal.franchiseId);
          setRestoreModal({ isOpen: false, franchiseId: "", franchiseName: "" });
        }}
        onClose={() => setRestoreModal({ isOpen: false, franchiseId: "", franchiseName: "" })}
      />
    </div>
  );
}
