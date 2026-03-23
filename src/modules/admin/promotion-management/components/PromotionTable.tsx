import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useGetPromotions } from "./hooks/useGetPromotions";
import { useGetPromotionById } from "./hooks/useGetPromotionById";
import { useDeletePromotion } from "./hooks/useDeletePromotion";
import { useRestorePromotion } from "./hooks/useRestorePromotion";
import PromotionDelete from "./PromotionDelete";
import PromotionRestore from "./PromotionRestore";
import PromotionDetailsModal from "./PromotionDetailsModal";
import PromotionCreateModal from "./PromotionCreateModal";
import PromotionEditModal from "./PromotionEditModal";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import type { Promotion, PromotionSearchCondition, PromotionType } from "./promotion.types";

// Inject keyframe animations once
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
`;
if (!document.head.querySelector("style[data-promotion-table]")) {
  styleSheet.setAttribute("data-promotion-table", "true");
  document.head.appendChild(styleSheet);
}

const PAGE_SIZE = 10;

const styles = {
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
  pagination: {
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600" as const,
    transition: "all 0.2s",
    cursor: "pointer" as const,
  },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const formatValue = (type: string, value: number) => {
  if (type === "FIXED") return `${value.toLocaleString("vi-VN")} ₫`;
  return `${value}%`;
};

interface ModalState {
  isOpen: boolean;
  id: string;
  name: string;
}

const defaultModal: ModalState = { isOpen: false, id: "", name: "" };

export default function PromotionTable() {
  const { promotions, isLoading, totalPages, totalItems, refetch } = useGetPromotions(true);
  const { deletePromotion, isDeleting } = useDeletePromotion();
  const { restorePromotion, isRestoring } = useRestorePromotion();
  const {
    promotion: selectedPromotion,
    // isLoading: isLoadingDetail,
    fetchById,
  } = useGetPromotionById();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [deleteModal, setDeleteModal] = useState<ModalState>(defaultModal);
  const [restoreModal, setRestoreModal] = useState<ModalState>(defaultModal);
  const [detailPromotion, setDetailPromotion] = useState<Promotion | null>(null);
  const [viewingPromotionId, setViewingPromotionId] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPromotionId, setEditPromotionId] = useState<string>("");

  // Filter states
  const [keyword, setKeyword] = useState(""); // search by code OR name
  const [franchiseFilter, setFranchiseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageInput, setPageInput] = useState("");

  // Franchise list for dropdown
  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);

  // Prevent page scroll (match other modules)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Core search function — accepts optional overrides so callers can pass
  // new values before React re-renders the state.
  // ---------------------------------------------------------------------------
  const doSearch = useCallback(
    (overrides: {
      kw?: string;
      franchiseId?: string;
      type?: string;
      active?: string;
      deleted?: boolean;
      page?: number;
    } = {}) => {
      const resolvedKw = overrides.kw !== undefined ? overrides.kw : keyword;
      const resolvedFranchise =
        overrides.franchiseId !== undefined ? overrides.franchiseId : franchiseFilter;
      const resolvedType = overrides.type !== undefined ? overrides.type : typeFilter;
      const resolvedActive = overrides.active !== undefined ? overrides.active : isActiveFilter;
      const resolvedDeleted = overrides.deleted !== undefined ? overrides.deleted : showDeleted;
      const resolvedPage = overrides.page ?? 1;

      setPageNum(resolvedPage);

      refetch({
        searchCondition: {
          keyword: resolvedKw.trim() || undefined,
          franchise_id: resolvedFranchise || undefined,
          type: (resolvedType as PromotionType) || undefined,
          is_active:
            resolvedActive === "" ? undefined : resolvedActive === "true",
          is_deleted: resolvedDeleted,
        } as PromotionSearchCondition,
        pageInfo: { pageNum: resolvedPage, pageSize: PAGE_SIZE },
      });
    },
     
    [keyword, franchiseFilter, typeFilter, isActiveFilter, showDeleted, refetch],
  );

  // Initial load + franchise list
  useEffect(() => {
    doSearch();
    franchiseApi
      .searchFranchises({
        searchCondition: { is_deleted: false, is_active: true },
        pageInfo: { pageNum: 1, pageSize: 100 },
      })
      .then((res) => setFranchises(res?.data ?? []))
      .catch(() => setFranchises([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Filter change handlers — update state AND immediately trigger search
  // with the new value (since state update is async, we pass the new value
  // explicitly as an override so the search uses it right away).
  // All filter changes reset to page 1 to avoid empty-page edge cases.
  // ---------------------------------------------------------------------------
  const handleFranchiseChange = (val: string) => {
    setFranchiseFilter(val);
    doSearch({ franchiseId: val, page: 1 });
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    doSearch({ type: val, page: 1 });
  };

  const handleActiveChange = (val: string) => {
    setIsActiveFilter(val);
    doSearch({ active: val, page: 1 });
  };

  const handleDeletedToggle = () => {
    const next = !showDeleted;
    setShowDeleted(next);
    doSearch({ deleted: next, page: 1 });
  };

  // Text search — triggered by button click or Enter key
  const handleSearch = () => {
    if (keyword.trim() || franchiseFilter || typeFilter || isActiveFilter !== "") {
      doSearch({ page: 1 });
    }
  };

  const handleClearKeyword = () => {
    setKeyword("");
    searchInputRef.current?.focus();
    // Only auto-search if there was previously a keyword
    doSearch({ kw: "", page: 1 });
  };

  const handleClearFilters = () => {
    setKeyword("");
    setFranchiseFilter("");
    setTypeFilter("");
    setIsActiveFilter("");
    setShowDeleted(false);
    refetch({
      searchCondition: { is_deleted: false } as PromotionSearchCondition,
      pageInfo: { pageNum: 1, pageSize: PAGE_SIZE },
    });
    setPageNum(1);
  };

  // ---------------------------------------------------------------------------
  // Pagination — keeps current filters, changes only the page.
  // ---------------------------------------------------------------------------
  const handlePageChange = (page: number) => {
    doSearch({ page });
  };

  const currentPage = pageNum;
  const setCurrentPage = handlePageChange;

  // ---------------------------------------------------------------------------
  // Delete / Restore — smart page recovery.
  // If the deleted item was the last one on a page > 1, go back one page so
  // the pagination never lands on an empty page.
  // ---------------------------------------------------------------------------
  const handleDeleteConfirm = () => {
    deletePromotion(deleteModal.id, () => {
      setDeleteModal(defaultModal);
      if (promotions.length === 1 && pageNum > 1) {
        doSearch({ page: pageNum - 1 });
      } else {
        doSearch({ page: pageNum });
      }
    });
  };

  const handleRestoreConfirm = () => {
    restorePromotion(restoreModal.id, () => {
      setRestoreModal(defaultModal);
      doSearch({ page: pageNum });
    });
  };

  const isActionLoading = isDeleting || isRestoring;

  // Build page-number range: max 3 buttons, sliding window
  const buildPageNumbers = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (pageNum === 1) return [1, 2, 3];
    if (pageNum === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [pageNum - 1, pageNum, pageNum + 1];
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          style={{
            width: "100%",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            flexShrink: 0,
          }}
        >
          {/* Breadcrumb */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#6c757d",
            }}
          >
            <span>Admin</span>
            <span style={{ fontSize: "16px" }}>›</span>
            <span style={{ color: "#212529", fontWeight: "500" }}>Promotion</span>
          </nav>

          {/* Title + Create button */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  letterSpacing: "-0.025em",
                  color: "#212529",
                  margin: 0,
                }}
              >
                Promotion Management
              </h2>
              <p style={{ color: "#6c757d", margin: 0 }}>
                Total: {isLoading ? "..." : totalItems} promotion
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#8B4513",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(139,69,19,0.2)",
                cursor: "pointer",
                border: "none",
                fontWeight: "700",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d3610")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B4513")}
            >
              <Plus size={18} />
              <span>Create Promotion</span>
            </button>
          </div>
        </header>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "0 32px 32px",
            overflow: "hidden",
          }}
        >
          {/* ── Filter bar ───────────────────────────────────────────────── */}
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
            {/* Row 1: keyword search + search button */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              {/* Keyword input */}
              <div style={{ flex: 1, position: "relative" }}>
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
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Find name or code of promotion..."
                  style={{
                    display: "block",
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    padding: "10px 36px 10px 40px",
                    color: "#212529",
                    backgroundColor: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                {keyword && (
                  <button
                    onClick={handleClearKeyword}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "10px",
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
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#bdbdbd";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#e0e0e0";
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search button */}
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
                  if (!isLoading) e.currentTarget.style.backgroundColor = "#6d4522";
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
                    Loading...
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

            {/* Row 2: dropdowns + toggle + clear */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Franchise filter */}
              <select
                value={franchiseFilter}
                onChange={(e) => handleFranchiseChange(e.target.value)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                  color: "#212529",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "200px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#bdbdbd")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              >
                <option value="">All Franchise</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                  color: "#212529",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#bdbdbd")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              >
                <option value="">Type</option>
                <option value="FIXED">Fixed (₫)</option>
                <option value="PERCENT">Percent (%)</option>
              </select>

              {/* Status filter */}
              <select
                value={isActiveFilter}
                onChange={(e) => handleActiveChange(e.target.value)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                  color: "#212529",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#bdbdbd")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              >
                <option value="">All status</option>
                <option value="true">Active</option>
                <option value="false">In Active</option>
              </select>

              {/* Toggle deleted */}
              <button
                onClick={handleDeletedToggle}
                style={{
                  padding: "9px 16px",
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = showDeleted ? "#f57c00" : "#bdbdbd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                {showDeleted ? "Archived" : "Available"}
              </button>

              {/* Clear all filters */}
              <button
                onClick={handleClearFilters}
                style={{
                  padding: "9px 16px",
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
                Clear Filter
              </button>
            </div>
          </div>

          {/* ── Table ────────────────────────────────────────────────────── */}
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
                style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    {[
                      "Franchise",
                      "Name",
                      "Type",
                      "Value",
                      "Validity",
                      "Status",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#6c757d",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                          textAlign: i === 6 ? "center" : "left",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderTop: "1px solid #e9ecef" }}>
                  {isLoading ? (
                    // Skeleton rows
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f8f9fa" }}>
                        <td colSpan={9} style={{ padding: "16px" }}>
                          <div
                            style={{ display: "flex", alignItems: "center", gap: "12px" }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: "16px",
                                backgroundColor: "#e0e0e0",
                                borderRadius: "4px",
                                animation: "pulse 1.5s ease-in-out infinite",
                              }}
                            />
                            <div
                              style={{
                                width: "30%",
                                height: "16px",
                                backgroundColor: "#eeeeee",
                                borderRadius: "4px",
                                animation: "pulse 1.5s ease-in-out infinite",
                              }}
                            />
                            <div
                              style={{
                                width: "15%",
                                height: "16px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "4px",
                                animation: "pulse 1.5s ease-in-out infinite",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : promotions.length === 0 ? (
                    // Empty state
                    <tr>
                      <td colSpan={9} style={{ padding: "60px 40px", textAlign: "center" }}>
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
                              <path d="M20 12V22H4V12" />
                              <path d="M22 7H2v5h20V7z" />
                              <path d="M12 22V7" />
                              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
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
                              Không tìm thấy promotion 
                            </h3>
                            <p style={{ fontSize: "14px", color: "#6c757d", margin: 0 }}>
                              {keyword
                                ? `Không có promotion nào khớp với "${keyword}"`
                                : "Không có dữ liệu để hiển thị"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    promotions.map((v) => (
                      <tr
                        key={v.id}
                        style={{
                          borderBottom: "1px solid #f8f9fa",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        
                        {/* Franchise */}
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: "13px",
                            color: "#495057",
                            maxWidth: "160px",
                          }}
                        >
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={v.franchise_name || v.franchise_id}
                          >
                            {v.franchise_name || v.franchise_id || "—"}
                          </div>
                        </td>

                        {/* Name */}
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: "14px",
                            color: "#212529",
                            fontWeight: "500",
                            maxWidth: "180px",
                          }}
                        >
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={v.name}
                          >
                            {v.name}
                          </div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor:
                                v.type === "FIXED" ? "#e3f2fd" : "#fff3e0",
                              color: v.type === "FIXED" ? "#1565c0" : "#e65100",
                            }}
                          >
                            {v.type === "FIXED" ? "Fixed" : "Percent"}
                          </span>
                        </td>

                        {/* Value */}
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#212529",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatValue(v.type, v.value)}
                        </td>

                        {/* Date range */}
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: "12px",
                            color: "#6c757d",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(v.start_date)}
                          <br />
                          <span style={{ color: "#9ca3af" }}>→</span>{" "}
                          {formatDate(v.end_date)}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: v.is_active ? "#e8f5e9" : "#fce4ec",
                              color: v.is_active ? "#2e7d32" : "#c62828",
                            }}
                          >
                            {v.is_active ? "Active" : "InActive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            {/* View */}
                            <button
                              onClick={async () => {
                                setViewingPromotionId(v.id);
                                setDetailPromotion(v);
                                await fetchById(v.id);
                              }}
                              disabled={viewingPromotionId === v.id}
                              title="Xem chi tiết"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                border: "none",
                                borderRadius: "6px",
                                backgroundColor: "transparent",
                                color: viewingPromotionId === v.id ? "#3366cc" : "#94a3b8",
                                cursor: viewingPromotionId === v.id ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                opacity: viewingPromotionId === v.id ? 0.8 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (viewingPromotionId !== v.id) {
                                  e.currentTarget.style.backgroundColor =
                                    "rgba(51,102,204,0.07)";
                                  e.currentTarget.style.color = "#3366cc";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (viewingPromotionId !== v.id) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }
                              }}
                            >
                              {viewingPromotionId === v.id ? (
                                <svg
                                  className="animate-spin"
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                              ) : (
                                <Eye size={17} />
                              )}
                            </button>

                            {!showDeleted && (
                              <>
                                {/* Edit */}
                                <button
                                  onClick={() => setEditPromotionId(v.id)}
                                  title="Chỉnh sửa"
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
                                      "rgba(139,69,19,0.07)";
                                    e.currentTarget.style.color = "#8B4513";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#94a3b8";
                                  }}
                                >
                                  <Pencil size={15} />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() =>
                                    setDeleteModal({
                                      isOpen: true,
                                      id: v.id,
                                      name: v.name,
                                    })
                                  }
                                  disabled={isActionLoading}
                                  title="Xóa"
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
                                    cursor: isActionLoading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    opacity: isActionLoading ? 0.6 : 1,
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isActionLoading) {
                                      e.currentTarget.style.backgroundColor = "#fee";
                                      e.currentTarget.style.color = "#ef4444";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#94a3b8";
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}

                            {showDeleted && (
                              /* Restore */
                              <button
                                onClick={() =>
                                  setRestoreModal({
                                    isOpen: true,
                                    id: v.id,
                                    name: v.name,
                                  })
                                }
                                disabled={isActionLoading}
                                title="Khôi phục"
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
                                  cursor: isActionLoading ? "not-allowed" : "pointer",
                                  transition: "all 0.2s",
                                  opacity: isActionLoading ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActionLoading) {
                                    e.currentTarget.style.backgroundColor =
                                      "rgba(76,175,80,0.07)";
                                    e.currentTarget.style.color = "#4caf50";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                              >
                                <RotateCcw size={15} />
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

                    {/* Pagination */}
          {!isLoading && promotions.length > 0 && totalPages > 1 && (
            <div style={styles.paginationContainer}>
              <span style={{ color: "#6b7280", fontWeight: "600" }}>
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                promotions
              </span>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={
                    {
                      ...getButtonStyles.pagination,
                      backgroundColor:
                        currentPage === 1 ? "#f3f4f6" : "#ffffff",
                      color: currentPage === 1 ? "#9ca3af" : "#374151",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  ‹
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages: (number | "...")[] = [...buildPageNumbers()];
                  // if (pages[pages.length - 1] < totalPages - 1) pages.push("...");
                  if (pages[pages.length - 1] !== totalPages) pages.push(totalPages);

                  return pages.map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        style={{
                          padding: "0 4px",
                          color: "#6b7280",
                          fontWeight: "600",
                          userSelect: "none",
                          lineHeight: "36px",
                        }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={
                          {
                            ...getButtonStyles.pagination,
                            backgroundColor:
                              currentPage === page ? "#8B5A2B" : "#ffffff",
                            color: currentPage === page ? "#ffffff" : "#374151",
                            fontWeight:
                              currentPage === page
                                ? ("700" as const)
                                : ("600" as const),
                            minWidth: "40px",
                            textAlign: "center" as const,
                          } as React.CSSProperties
                        }
                        onMouseEnter={(e) => {
                          if (currentPage !== page) {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                            e.currentTarget.style.borderColor = "#d1d5db";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== page) {
                            e.currentTarget.style.backgroundColor = "#ffffff";
                            e.currentTarget.style.borderColor = "#e5e7eb";
                          }
                        }}
                      >
                        {page}
                      </button>
                    ),
                  );
                })()}

                {/* Next Button */}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={
                    {
                      ...getButtonStyles.pagination,
                      backgroundColor:
                        currentPage === totalPages ? "#f3f4f6" : "#ffffff",
                      color: currentPage === totalPages ? "#9ca3af" : "#374151",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  ›
                </button>

                {/* Go to page */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>Đến trang</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const num = parseInt(pageInput, 10);
                        if (!isNaN(num) && num >= 1 && num <= totalPages) {
                          setCurrentPage(num);
                        }
                        setPageInput("");
                      }
                    }}
                    placeholder={String(currentPage)}
                    style={{
                      width: "52px",
                      height: "36px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      outline: "none",
                      padding: "0 4px",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#8B5A2B"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <PromotionDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(defaultModal)}
        onConfirm={handleDeleteConfirm}
        promotionId={deleteModal.id}
        promotionName={deleteModal.name}
      />
      <PromotionRestore
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal(defaultModal)}
        onConfirm={handleRestoreConfirm}
        promotionId={restoreModal.id}
        promotionName={restoreModal.name}
      />
      <PromotionDetailsModal
        isOpen={!!detailPromotion}
        onClose={() => {
          setDetailPromotion(null);
          setViewingPromotionId("");
        }}
        promotion={selectedPromotion || detailPromotion}
        // isLoading={isLoadingDetail}
      />
      <PromotionCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => doSearch({ page: 1 })}
      />
      <PromotionEditModal
        isOpen={!!editPromotionId}
        promotionId={editPromotionId}
        onClose={() => setEditPromotionId("")}
        onSuccess={() => doSearch({ page: pageNum })}
      />
    </div>
  );
}
