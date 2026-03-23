import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, RotateCcw, X } from "lucide-react";
import CustomerDelete from "./CustomerDelete";
import CustomerDetail from "./CustomerDetail";
import { useCustomerSearch } from "../hooks";
import { useCustomerStatus } from "./hooks/useCustomerStatus";
import { useDeleteCustomer } from "./hooks/useDeleteCustomer";
import { useRestoreCustomer } from "./hooks/useRestoreCustomer";
import type { Customer } from "../../../../types/customer.types";

// ============================================================================
// TYPES
// ============================================================================

interface DeleteModal {
  isOpen: boolean;
  customerId: string;
  customerName: string;
}

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

// ============================================================================
// BUTTON STYLES
// ============================================================================

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

export default function CustomerTable() {
  const navigate = useNavigate();

  // ========================================================================
  // SEARCH HOOK
  // ========================================================================
  const {
    data: customers,
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
    totalPages,
    totalItems,
  } = useCustomerSearch();

  // Refs for search functionality
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(-1);

  // ========================================================================
  // OTHER CUSTOM HOOKS
  // ========================================================================
  const { toggleStatus, updatingId } = useCustomerStatus();
  const { deleteCustomer, isDeleting } = useDeleteCustomer();
  const { restoreCustomer, isRestoring } = useRestoreCustomer();

  // ========================================================================
  // LOCAL STATE
  // ========================================================================
  const [customerStatus, setCustomerStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    isOpen: false,
    customerId: "",
    customerName: "",
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; customer: (typeof customers)[0] | null }>({
    isOpen: false,
    customer: null,
  });
  const [pageInput, setPageInput] = useState("");

  // ========================================================================
  // EFFECTS
  // ========================================================================

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

  // Auto-correct currentPage if it exceeds totalPages after deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleSearch = () => {
    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    executeSearch();
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, keyword: "" }));
    searchInputRef.current?.focus();
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
    setFilters((prev) => ({ ...prev, is_active: value }));
    setCurrentPage(1);
    void executeSearch({ is_active: value, page: 1 });
  };

  const handleToggleCustomerStatus = (customerId: string) => {
    // Get current status from state or customer data
    const currentStatus =
      customerStatus[customerId] ??
      customers.find((c) => c.id === customerId)?.is_active ??
      false;

    console.log(
      `🎯 Toggle status clicked for customer ${customerId}. Current status: ${currentStatus}`,
    );

    // Optimistic UI update: Update state immediately
    setCustomerStatus((prev) => ({
      ...prev,
      [customerId]: !currentStatus,
    }));

    // Call API to update customer status
    toggleStatus(
      customerId,
      currentStatus,
      () => {
        // onSuccess - Refresh data
        console.log("✅ Toggle status success, refreshing data...");
        executeSearch();
      },
      () => {
        // onError - Rollback to previous state
        console.log("❌ Toggle status failed, rolling back UI...");
        setCustomerStatus((prev) => ({
          ...prev,
          [customerId]: currentStatus,
        }));
      },
    );
  };

  const handleRestore = (id: string) => {
    restoreCustomer(id, () => {
      executeSearch();
    });
  };

  const handleDeleteClick = (customerId: string, customerName: string) => {
    setDeleteModal({
      isOpen: true,
      customerId,
      customerName,
    });
  };

  const handleDeleteConfirm = () => {
    // Prevent double clicks
    if (isDeleting) return;

    // Call API to delete customer
    deleteCustomer(deleteModal.customerId, () => {
      // onSuccess: Close modal and refresh data
      setDeleteModal({ isOpen: false, customerId: "", customerName: "" });

      // Refresh customer list by executing search again
      executeSearch();
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
  };

  // ========================================================================
  // RENDER - TABLE ROW
  // ========================================================================

  const renderTableRow = (customer: Customer, index: number) => {
    const isActive = customerStatus[customer.id] ?? customer.is_active;

    return (
      <tr
        key={customer.id}
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
                backgroundImage: `url('${customer.avatar_url}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid #e5e7eb",
              }}
            />
            <span style={{ fontWeight: "600", color: "#1f2937" }}>
              {customer.name}
            </span>
          </div>
        </td>

        {/* Email */}
        <td style={{ padding: "16px 20px", color: "#6b7280" }}>
          {customer.email || "—"}
        </td>

        {/* Phone */}
        <td style={{ padding: "16px 20px", color: "#6b7280" }}>
          {customer.phone}
        </td>

        {/* Status Toggle */}
        <td style={{ padding: "16px 20px" }}>
          <label style={getButtonStyles.toggleSwitch as React.CSSProperties}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => handleToggleCustomerStatus(customer.id)}
              disabled={updatingId === customer.id}
              style={getButtonStyles.toggleInput as React.CSSProperties}
            />
            <div
              style={{
                width: "44px",
                height: "24px",
                backgroundColor: isActive ? "#8B5A2B" : "#d1d5db",
                borderRadius: "12px",
                transition: "background-color 0.3s",
                position: "relative",
                opacity: updatingId === customer.id ? 0.5 : 1,
                cursor: updatingId === customer.id ? "not-allowed" : "pointer",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: isActive ? "22px" : "2px",
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
            {/* View Button */}
            <button
              onClick={() => setViewModal({ isOpen: true, customer })}
              style={
                {
                  ...getButtonStyles.actionButton,
                  color: "#94a3b8",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(51,102,204,0.07)";
                e.currentTarget.style.color = "#3366cc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#94a3b8";
              }}
              title="View"
            >
              <Eye size={20} />
            </button>

            {/* Edit Button */}
            {!customer.is_deleted && (
            <button
              onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
              style={
                {
                  ...getButtonStyles.actionButton,
                  color: "#94a3b8",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(139,69,19,0.07)";
                e.currentTarget.style.color = "#8B4513";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#94a3b8";
              }}
              title="Edit"
            >
              <Edit2 size={20} />
            </button>
            )}

            {/* Delete / Restore Button */}
            <button
              onClick={() =>
                customer.is_deleted
                  ? handleRestore(customer.id.toString())
                  : handleDeleteClick(customer.id.toString(), customer.name)
              }
              style={
                {
                  ...getButtonStyles.actionButton,
                  color: "#94a3b8",
                } as React.CSSProperties
              }
              disabled={isDeleting || isRestoring}
              onMouseEnter={(e) => {
                if (customer.is_deleted) {
                  e.currentTarget.style.backgroundColor = "rgba(76,175,80,0.07)";
                  e.currentTarget.style.color = "#4caf50";
                } else {
                  e.currentTarget.style.backgroundColor = "#fee";
                  e.currentTarget.style.color = "#ef4444";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#94a3b8";
              }}
              title={customer.is_deleted ? "Restore" : "Delete"}
            >
              {customer.is_deleted ? <RotateCcw size={20} /> : <Trash2 size={20} />}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
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
                Customers
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
                Customer Management
              </h1>
              <p style={{ color: "#6c757d", margin: 0, fontSize: "15px" }}>
                Total Customers: {totalItems || 0}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/customers/create")}
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
              <span>Create Customer</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {/* Filters */}
          <div style={styles.filterContainer}>
            {/* Row 1: Search Bar + Search Button */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
            {/* Search Bar with History */}
            <div
              style={{ flex: 1, minWidth: "300px", position: "relative" }}
              ref={dropdownRef}
            >
              <div style={{ position: "relative" }}>
                {/* Search Icon */}
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

                {/* Search Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name, email, phone... (Ctrl+K)"
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

                {/* Clear Button */}
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

              {/* Search Dropdown - History */}
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
                        Recent searches
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
                        Clear
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

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              style={{
                ...getButtonStyles.primary,
                minWidth: "110px",
                height: "42px",
              }}
              aria-label="Search customers"
            >
              <span className="material-symbols-outlined">search</span>
              <span>Search</span>
            </button>
            </div>{/* end Row 1 */}

            {/* Row 2: Filter dropdowns + Current/Deleted toggle + Clear */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Status Filter */}
              <select
                value={String(filters.is_active ?? "")}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                style={{
                  padding: "9px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "160px",
                }}
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              {/* Current / Deleted Toggle */}
              <button
                onClick={() => {
                  const newIsDeleted = !filters.is_deleted;
                  setFilters((prev) => ({ ...prev, is_deleted: newIsDeleted }));
                  setCurrentPage(1);
                  void executeSearch({ is_deleted: newIsDeleted, page: 1 } as never);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = filters.is_deleted ? "#f57c00" : "#bdbdbd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: filters.is_deleted ? "#fff3e0" : "white",
                  color: filters.is_deleted ? "#f57c00" : "#6c757d",
                  fontWeight: "500",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
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
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                {filters.is_deleted ? "Deleted" : "Current"}
              </button>

              {/* Clear Filters Button */}
              <button
                onClick={() => {
                  clearFilters();
                  void executeSearch({ keyword: "", is_active: "", is_deleted: false, page: 1 } as never);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)";
                  e.currentTarget.style.color = "#111827";
                  e.currentTarget.style.borderColor = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                style={{
                  padding: "9px 16px",
                  backgroundColor: "transparent",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                Clear filters
              </button>
            </div>{/* end Row 2 */}
          </div>

          {/* Table */}
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
                    Email
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
                    Phone
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
                {/* Loading State */}
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
                        Đang tải dữ liệu khách hàng...
                      </div>
                    </td>
                  </tr>
                )}

                {/* Error State */}
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

                {/* Data State */}
                {!isLoading && !error && customers?.length > 0 && (
                  <>
                    {customers.map((customer, index) =>
                      renderTableRow(customer, index),
                    )}
                  </>
                )}

                {/* Empty State */}
                {!isLoading && !error && customers?.length === 0 && (
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
                          marginBottom: "8px",
                          color: "#1f2937",
                        }}
                      >
                        No customers found
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          margin: "0",
                          color: "#6b7280",
                        }}
                      >
                        Try adjusting your filters or create a new customer.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && customers.length > 0 && totalPages > 1 && (
            <div style={styles.paginationContainer}>
              <span style={{ color: "#6b7280", fontWeight: "600" }}>
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                customers
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
                  const pages: (number | "...")[] = [];

                  if (totalPages <= 4) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    const windowStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
                    const windowEnd = windowStart + 2;
                    for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
                    if (windowEnd < totalPages - 1) pages.push("...");
                    if (windowEnd < totalPages) pages.push(totalPages);
                  }

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
      </main>

      {/* Delete Modal */}
      <CustomerDelete
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        customerName={deleteModal.customerName}
        customerId={deleteModal.customerId}
        isDeleting={isDeleting}
      />

      {/* View Modal */}
      {viewModal.isOpen && viewModal.customer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setViewModal({ isOpen: false, customer: null })}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                flexShrink: 0,
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Customer Details
              </h2>
              <button
                onClick={() => setViewModal({ isOpen: false, customer: null })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              <CustomerDetail customer={viewModal.customer} />
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setViewModal({ isOpen: false, customer: null })}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
