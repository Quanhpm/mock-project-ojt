import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, RotateCcw, Package } from "lucide-react";
import { useFranchiseSearch } from "../hooks";
import { franchiseApi } from "../../../../apis/endpoints/franchise.api";
import { useToast } from "@/hooks/use-toast.hook";
import type { Franchise } from "../../../../types/franchise.types";

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

  const {
    franchises,
    isLoading,
    error,
    filters,
    setFilters,
    executeSearch,
    clearFilters,
    searchHistory,
    clearHistory,
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    deleteFranchise,
    toggleFranchiseStatus,
    restoreFranchise,
  } = useFranchiseSearch();
  useEffect(() => {
    executeSearch();
  }, [currentPage]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(-1);
  const [isLoadingDetail, setIsLoadingDetail] = useState<number | null>(null);
  const { error: showError } = useToast();

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Keyboard shortcuts (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchDropdownOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchDropdownOpen]);

  const handleDeletedFilterChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, is_deleted: value }));
    setCurrentPage(1);
    setTimeout(() => executeSearch(), 0);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchDropdownOpen]);

  const handleSearch = () => {
    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    executeSearch();
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, keyword: "" }));
    searchInputRef.current?.focus();
  };

  const handleViewFranchise = async (id: string | number) => {
    setIsLoadingDetail(id);
    try {
      await franchiseApi.getFranchiseById(String(id));
      navigate(`/admin/franchises/view/${id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi tải chi tiết nhượng quyền";
      showError("Lỗi", errorMessage);
    } finally {
      setIsLoadingDetail(null);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchDropdownOpen || searchHistory.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedHistoryIndex((prev) =>
          prev < searchHistory.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedHistoryIndex >= 0) {
          setFilters((prev) => ({
            ...prev,
            keyword: searchHistory[selectedHistoryIndex],
          }));
          setIsSearchDropdownOpen(false);
          setSelectedHistoryIndex(-1);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
        break;
    }
  };

  const handleStatusFilterChange = (value: string) => {
    let is_active: boolean | null;
    if (value === "null") {
      is_active = null;
    } else if (value === "true") {
      is_active = true;
    } else {
      is_active = false;
    }
    setFilters((prev) => ({ ...prev, is_active }));
    setCurrentPage(1);
    setTimeout(() => executeSearch(), 0);
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
                cursor: isLoading ? "not-allowed" : "pointer",
              } as React.CSSProperties
            }
          >
            <input
              type="checkbox"
              checked={franchise.is_active}
              onChange={() =>
                !isLoading && toggleFranchiseStatus(franchise.id, franchise.is_active)
              }
              style={getButtonStyles.toggleInput as React.CSSProperties}
              disabled={isLoading}
            />
            <div
              style={{
                width: "44px",
                height: "24px",
                backgroundColor: franchise.is_active ? "#8B5A2B" : "#d1d5db",
                borderRadius: "12px",
                transition: "background-color 0.3s",
                position: "relative",
                opacity: isLoading ? 0.6 : 1,
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
              disabled={isLoadingDetail === franchise.id}
              style={
                {
                  ...getButtonStyles.actionButton,
                  color: isLoadingDetail === franchise.id ? "#c0c0c0" : "#4b5563",
                  opacity: isLoadingDetail === franchise.id ? 0.6 : 1,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (isLoadingDetail !== franchise.id) {
                  e.currentTarget.style.backgroundColor = "#e0f2fe";
                  e.currentTarget.style.color = "#0066cc";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color =
                  isLoadingDetail === franchise.id ? "#c0c0c0" : "#4b5563";
              }}
              title={isLoadingDetail === franchise.id ? "Đang tải..." : "View"}
            >
              <Eye size={20} />
            </button>

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

            <button
              onClick={() => {
                if (franchise.is_deleted) {
                  if (
                    window.confirm(
                      `Bạn có chắc chắn muốn phục hồi nhượng quyền "${franchise.name}"?`
                    )
                  ) {
                    restoreFranchise(franchise.id);
                  }
                } else {
                  if (
                    window.confirm(
                      `Bạn có chắc chắn muốn xóa nhượng quyền "${franchise.name}"?`
                    )
                  ) {
                    deleteFranchise(franchise.id);
                  }
                }
              }}
              style={
                {
                  ...getButtonStyles.actionButton,
                  color: franchise.is_deleted ? "#16a34a" : "#4b5563",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (franchise.is_deleted) {
                  e.currentTarget.style.backgroundColor = "#d1fae5";
                  e.currentTarget.style.color = "#15803d";
                } else {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = franchise.is_deleted ? "#16a34a" : "#4b5563";
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
          <div style={styles.filterContainer}>
            <div
              style={{ flex: 1, minWidth: "300px", position: "relative" }}
              ref={dropdownRef}
            >
              <div style={{ position: "relative" }}>
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
                  placeholder="Tìm kiếm theo tên, mã, địa chỉ... (Ctrl+K)"
                  value={filters.keyword}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      keyword: e.target.value,
                    }));
                    if (e.target.value.trim()) {
                      setIsSearchDropdownOpen(false);
                    }
                  }}
                  onFocus={() => {
                    if (!filters.keyword.trim() && searchHistory.length > 0) {
                      setIsSearchDropdownOpen(true);
                    }
                  }}
                  onKeyDown={handleSearchKeyDown}
                  style={
                    {
                      ...getButtonStyles.filterInput,
                      paddingLeft: "40px",
                      paddingRight: filters.keyword ? "40px" : "14px",
                      flex: 1,
                    } as React.CSSProperties
                  }
                  onFocusCapture={(e) => {
                    e.currentTarget.style.borderColor = "#8B5A2B";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                />

                {filters.keyword && (
                  <button
                    onClick={handleClearSearch}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "12px",
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
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#bdbdbd";
                      e.currentTarget.style.color = "#212529";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#e0e0e0";
                      e.currentTarget.style.color = "#6c757d";
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {isSearchDropdownOpen &&
                searchHistory.length > 0 &&
                !filters.keyword && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      zIndex: 50,
                      maxHeight: "250px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6c757d",
                          textTransform: "uppercase",
                        }}
                      >
                        Tìm kiếm gần đây
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearHistory();
                          setIsSearchDropdownOpen(false);
                        }}
                        style={{
                          fontSize: "11px",
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fee")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "transparent")
                        }
                      >
                        Xóa
                      </button>
                    </div>
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, keyword: item }));
                          setIsSearchDropdownOpen(false);
                          setSelectedHistoryIndex(-1);
                        }}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor:
                            selectedHistoryIndex === index
                              ? "#f3f4f6"
                              : "transparent",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          selectedHistoryIndex === index
                            ? "#f3f4f6"
                            : "transparent")
                        }
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ color: "#9ca3af" }}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span style={{ fontSize: "14px", color: "#374151" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <button
              type="button"
              onClick={handleSearch}
              style={{
                ...getButtonStyles.primary,
                minWidth: "110px",
                height: "42px",
              }}
            >
              Tìm kiếm
            </button>

            <div style={{ minWidth: "140px" }}>
              <select
                value={filters.is_active === null ? "null" : String(filters.is_active)}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                style={getButtonStyles.filterInput as React.CSSProperties}
              >
                <option value="null">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>
            </div>

            {/* Deleted Filter */}
            <div style={{ minWidth: "140px" }}>
              <select
                value={filters.is_deleted ? "true" : "false"}
                onChange={(e) =>
                  handleDeletedFilterChange(e.target.value === "true")
                }
                style={getButtonStyles.filterInput as React.CSSProperties}
              >
                <option value="false">Chưa xóa</option>
                <option value="true">Đã xóa</option>
              </select>
            </div>

            <button
              onClick={() => {
                clearFilters();
                setCurrentPage(1);
              }}
              style={getButtonStyles.clearFilter as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
            >
              Xóa bộ lọc
            </button>
          </div>

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
                        Đang tải dữ liệu nhượng quyền...
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
                        ❌ Có lỗi xảy ra
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
                        📭 Không có dữ liệu
                      </div>
                      <p style={{ fontSize: "14px", margin: "0" }}>
                        Hãy thử điều chỉnh bộ lọc hoặc tạo một nhượng quyền mới
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                  return (
                    page >= 1 &&
                    page <= totalPages && (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          ...getButtonStyles.pagination,
                          backgroundColor:
                            page === currentPage ? "#8B5A2B" : "white",
                          color:
                            page === currentPage ? "white" : "#374151",
                        } as React.CSSProperties}
                      >
                        {page}
                      </button>
                    )
                  );
                })}
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
