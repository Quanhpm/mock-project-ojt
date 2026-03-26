import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Eye, Pencil } from "lucide-react";
import { useGetLoyaltyRules } from "./hooks/useGetLoyaltyRules";
import LoyaltyRuleDetailsModal from "@/modules/admin/loyalty-rule/components/LoyaltyRuleDetailsModal";
import LoyaltyRuleCreateModal from "@/modules/admin/loyalty-rule/components/LoyaltyRuleCreateModal";
import LoyaltyRuleEditModal from "@/modules/admin/loyalty-rule/components/LoyaltyRuleEditModal";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import type {
  LoyaltyRule,
  LoyaltyRuleSearchCondition,
  LoyaltyTier,
} from "./loyalty-rule.types";

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
  @media (max-width: 1024px) {
    [data-loyalty-shell] { height: auto; min-height: 100dvh; overflow-x: hidden; }
    [data-loyalty-main] { height: auto; min-height: 100dvh; overflow: visible; }
    [data-loyalty-header], [data-loyalty-content] { padding-left: 16px !important; padding-right: 16px !important; }
    [data-loyalty-content] { overflow: visible !important; }
    [data-loyalty-filter-panel] { padding: 12px !important; }
    [data-loyalty-search-row], [data-loyalty-filter-row] { flex-direction: column !important; align-items: stretch !important; }
    [data-loyalty-search-row] > *, [data-loyalty-filter-row] > * { width: 100% !important; min-width: 0 !important; }
    [data-loyalty-search-row] button, [data-loyalty-filter-row] button { width: 100%; justify-content: center; }
    [data-loyalty-table-wrap] { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    [data-loyalty-table-wrap] table { min-width: 980px; }
    [data-loyalty-pagination] { flex-direction: column; align-items: stretch; gap: 12px; }
    [data-loyalty-pagination] > div, [data-loyalty-pagination] nav { width: 100%; justify-content: center; flex-wrap: wrap; }
  }
`;
if (!document.head.querySelector("style[data-loyalty-rule-table]")) {
  styleSheet.setAttribute("data-loyalty-rule-table", "true");
  document.head.appendChild(styleSheet);
}

const PAGE_SIZE = 10;

export default function LoyaltyRuleTable() {
  const { loyaltyRules, isLoading, totalPages, totalItems, refetch } = useGetLoyaltyRules();

  const earnInputRef = useRef<HTMLInputElement>(null);

  const [detailRule, setDetailRule] = useState<LoyaltyRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editRuleId, setEditRuleId] = useState<string>("");

  const [franchiseFilter, setFranchiseFilter] = useState("");
  const [earnAmountFilter, setEarnAmountFilter] = useState("");
  const [redeemValueFilter, setRedeemValueFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDesktopViewport ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDesktopViewport]);

  const doSearch = useCallback(
    (page?: number) => {
      const resolvedPage = page ?? currentPage;

      return refetch({
        searchCondition: {
          franchise_id: franchiseFilter || undefined,
          earn_amount_per_point: earnAmountFilter ? Number(earnAmountFilter) : "",
          redeem_value_per_point: redeemValueFilter ? Number(redeemValueFilter) : "",
          tier: (tierFilter as LoyaltyTier) || "",
          is_active: isActiveFilter === "" ? "" : isActiveFilter === "true",
          is_deleted: showDeleted,
        } as LoyaltyRuleSearchCondition,
        pageInfo: { pageNum: resolvedPage, pageSize: PAGE_SIZE },
      });
    },
    [
      currentPage,
      franchiseFilter,
      earnAmountFilter,
      redeemValueFilter,
      tierFilter,
      isActiveFilter,
      showDeleted,
      refetch,
    ],
  );

  useEffect(() => {
    void doSearch(currentPage);
    // doSearch changes when filters update; page-based fetching should only run on page changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    franchiseApi
      .searchFranchises({
        searchCondition: { is_deleted: false, is_active: true },
        pageInfo: { pageNum: 1, pageSize: 100 },
      })
      .then((res) => setFranchises(res?.data ?? []))
      .catch(() => setFranchises([]));
  }, []);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSearch = () => {
    if (currentPage === 1) {
      void doSearch(1);
      return;
    }
    setCurrentPage(1);
  };

  const handleClearEarnAmount = () => {
    setEarnAmountFilter("");
    earnInputRef.current?.focus();
    if (currentPage === 1) {
      void doSearch(1);
      return;
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFranchiseFilter("");
    setEarnAmountFilter("");
    setRedeemValueFilter("");
    setTierFilter("");
    setIsActiveFilter("");
    setShowDeleted(false);

    if (currentPage === 1) {
      void refetch({
        searchCondition: { is_deleted: false },
        pageInfo: { pageNum: 1, pageSize: PAGE_SIZE },
      });
      return;
    }
    setCurrentPage(1);
  };

  const handleFranchiseChange = (val: string) => {
    setFranchiseFilter(val);
  };

  const handleTierChange = (val: string) => {
    setTierFilter(val);
  };

  const handleActiveChange = (val: string) => {
    setIsActiveFilter(val);
  };

  const handleDeletedToggle = () => {
    setShowDeleted((prev) => !prev);
  };

  const buildPageNumbers = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  return (
    <div
      data-loyalty-shell
      style={{
        display: "flex",
        minHeight: "100dvh",
        width: "100%",
        overflowX: "hidden",
        overflowY: isDesktopViewport ? "hidden" : "visible",
      }}
    >
      <main
        data-loyalty-main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          overflow: isDesktopViewport ? "hidden" : "visible",
        }}
      >
        <header
          data-loyalty-header
          style={{
            width: "100%",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            flexShrink: 0,
          }}
        >
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
            <span style={{ color: "#212529", fontWeight: "500" }}>Loyalty Rule</span>
          </nav>

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
                Quản lý Loyalty Rule
              </h2>
              <p style={{ color: "#6c757d", margin: 0 }}>
                Tổng cộng: {isLoading ? "..." : totalItems} loyalty rules
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
              <span>Tạo Loyalty Rule</span>
            </button>
          </div>
        </header>

        <div
          data-loyalty-content
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "0 32px 32px",
            overflow: isDesktopViewport ? "hidden" : "visible",
            minHeight: 0,
          }}
        >
          <div
            data-loyalty-filter-panel
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
              data-loyalty-search-row
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  ref={earnInputRef}
                  type="number"
                  value={earnAmountFilter}
                  onChange={(e) => setEarnAmountFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Lọc theo earn amount / point"
                  style={{
                    display: "block",
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    padding: "10px 36px 10px 12px",
                    color: "#212529",
                    backgroundColor: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                {earnAmountFilter && (
                  <button
                    onClick={handleClearEarnAmount}
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
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  value={redeemValueFilter}
                  onChange={(e) => setRedeemValueFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Lọc theo redeem value / point"
                  style={{
                    display: "block",
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    padding: "10px 12px",
                    color: "#212529",
                    backgroundColor: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

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
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Đang tìm...
                  </>
                ) : (
                  <>Tìm kiếm</>
                )}
              </button>
            </div>

            <div
              data-loyalty-filter-row
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
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
              >
                <option value="">Tất cả Franchise</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <select
                value={tierFilter}
                onChange={(e) => handleTierChange(e.target.value)}
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
              >
                <option value="">Tất cả tier</option>
                <option value="BRONZE">BRONZE</option>
                <option value="SILVER">SILVER</option>
                <option value="GOLD">GOLD</option>
                <option value="PLATINUM">PLATINUM</option>
              </select>

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
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>

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
                }}
              >
                {showDeleted ? "Đã xóa" : "Hiện tại"}
              </button>

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
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          <div
            data-loyalty-table-wrap
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
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    {[
                      "Franchise",
                      "Earn / Point",
                      "Redeem / Point",
                      "Min / Max Redeem",
                      "Tier Rules",
                      "Trang thai",
                      "Thao tac",
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
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f8f9fa" }}>
                        <td colSpan={7} style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ flex: 1, height: "16px", backgroundColor: "#e0e0e0", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
                            <div style={{ width: "30%", height: "16px", backgroundColor: "#eeeeee", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
                            <div style={{ width: "15%", height: "16px", backgroundColor: "#f5f5f5", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : loyaltyRules.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "60px 40px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M9 12h6" />
                            </svg>
                          </div>
                          <div>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#212529", margin: "0 0 8px 0" }}>
                              Không tìm thấy loyalty rule
                            </h3>
                            <p style={{ fontSize: "14px", color: "#6c757d", margin: 0 }}>
                              Không có dữ liệu để hiển thị
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    loyaltyRules.map((rule) => (
                      <tr
                        key={rule.id}
                        style={{ borderBottom: "1px solid #f8f9fa", transition: "background-color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#495057", maxWidth: "180px" }}>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={rule.franchise_name || rule.franchise_id}>
                            {rule.franchise_name || rule.franchise_id}
                          </div>
                        </td>

                        <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: "600", color: "#212529", whiteSpace: "nowrap" }}>
                          {rule.earn_amount_per_point.toLocaleString("vi-VN")} VND
                        </td>

                        <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: "600", color: "#212529", whiteSpace: "nowrap" }}>
                          {rule.redeem_value_per_point.toLocaleString("vi-VN")} VND
                        </td>

                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#495057", whiteSpace: "nowrap" }}>
                          {rule.min_redeem_points} / {rule.max_redeem_points}
                        </td>

                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#495057", maxWidth: "260px" }}>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={rule.tier_rules.map((t) => t.tier).join(", ")}>
                            {rule.tier_rules.map((t) => t.tier).join(", ")}
                          </div>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: rule.is_active ? "#e8f5e9" : "#fce4ec",
                              color: rule.is_active ? "#2e7d32" : "#c62828",
                            }}
                          >
                            {rule.is_active ? "Hoạt động" : "Ngừng"}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            <button
                              onClick={() => setDetailRule(rule)}
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
                                color: "#94a3b8",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(51,102,204,0.07)";
                                e.currentTarget.style.color = "#3366cc";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                            >
                              <Eye size={17} />
                            </button>

                            {!showDeleted && (
                              <button
                                onClick={() => setEditRuleId(rule.id)}
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
                                  e.currentTarget.style.backgroundColor = "rgba(139,69,19,0.07)";
                                  e.currentTarget.style.color = "#8B4513";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }}
                              >
                                <Pencil size={15} />
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

            {totalPages > 0 && (
              <div
                data-loyalty-pagination
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
                <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>
                  Hiển thị trang <span style={{ fontWeight: "500" }}>{currentPage}</span> trong <span style={{ fontWeight: "500" }}>{totalPages}</span> trang (
                  <span style={{ fontWeight: "500" }}>{totalItems}</span> loyalty rules)
                </p>

                <nav aria-label="Phân trang" style={{ display: "inline-flex" }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                    }}
                  >
                    Trước
                  </button>

                  {buildPageNumbers().map((page, i, arr) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "40px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        fontWeight: currentPage === page ? "600" : "500",
                        color: currentPage === page ? "white" : "#374151",
                        backgroundColor: currentPage === page ? "#8B4513" : "white",
                        border: "1px solid",
                        borderColor: currentPage === page ? "#8B4513" : "#e5e7eb",
                        borderRight: i < arr.length - 1 ? "none" : undefined,
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                    }}
                  >
                    Sau
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      <LoyaltyRuleDetailsModal
        isOpen={!!detailRule}
        onClose={() => setDetailRule(null)}
        loyaltyRule={detailRule}
      />
      <LoyaltyRuleCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          if (currentPage === 1) {
            void doSearch(1);
            return;
          }
          setCurrentPage(1);
        }}
      />
      <LoyaltyRuleEditModal
        isOpen={!!editRuleId}
        loyaltyRuleId={editRuleId}
        onClose={() => setEditRuleId("")}
        onSuccess={() => {
          void doSearch(currentPage);
        }}
      />
    </div>
  );
}
