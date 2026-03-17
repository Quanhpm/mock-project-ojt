import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, RotateCcw } from "lucide-react";
import CustomerDelete from "./CustomerDelete";
import { useCustomerSearch } from "../hooks";
import { useCustomerStatus } from "./hooks/useCustomerStatus";
import { useDeleteCustomer } from "./hooks/useDeleteCustomer";
import { useRestoreCustomer } from "./hooks/useRestoreCustomer";
import { useToast } from "@/hooks/use-toast.hook";
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
  const { success, error: toastError } = useToast();

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
  };

  const handleDeletedFilterChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, is_deleted: value }));
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
    deleteCustomer(
      deleteModal.customerId,
      () => {
        setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
        success(
          "Xóa thành công",
          `Khách hàng "${deleteModal.customerName}" đã được xóa.`,
        );
        executeSearch();
      },
      (errMsg) => {
        toastError("Xóa thất bại", errMsg);
      },
    );
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
  };

  const handleRestoreCustomer = (customerId: string, customerName: string) => {
    restoreCustomer(
      customerId,
      () => {
        success(
          "Khôi phục thành công",
          `Khách hàng "${customerName}" đã được khôi phục.`,
        );
        executeSearch();
      },
      (errMsg) => {
        toastError("Khôi phục thất bại", errMsg);
      },
    );
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
            {customer.is_deleted ? (
              // Restore Button (only for deleted customers)
              <button
                onClick={() => handleRestoreCustomer(customer.id, customer.name)}
                disabled={isRestoring}
                style={
                  {
                    ...getButtonStyles.actionButton,
                    color: "#4b5563",
                    opacity: isRestoring ? 0.5 : 1,
                    cursor: isRestoring ? "not-allowed" : "pointer",
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  if (!isRestoring) {
                    e.currentTarget.style.backgroundColor = "#d1fae5";
                    e.currentTarget.style.color = "#065f46";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#4b5563";
                }}
                title="Khôi phục"
              >
                <RotateCcw size={20} />
              </button>
            ) : (
              <>
                {/* View Button */}
                <button
                  onClick={() => navigate(`/admin/customers/${customer.id}`)}
                  style={
                    {
                      ...getButtonStyles.actionButton,
                      color: "#4b5563",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e0f2fe";
                    e.currentTarget.style.color = "#0066cc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }}
                  title="View"
                >
                  <Eye size={20} />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
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

                {/* Delete Button */}
                <button
                  onClick={() =>
                    handleDeleteClick(customer.id.toString(), customer.name)
                  }
                  style={
                    {
                      ...getButtonStyles.actionButton,
                      color: "#4b5563",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fee2e2";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }}
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
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
                  placeholder="Tìm kiếm theo tên, email, số điện thoại... (Ctrl+K)"
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
              <span>Tìm kiếm</span>
            </button>
            
            {/* Status Filter */}
            <div style={{ minWidth: "140px" }}>
              <select
                value={filters.is_active}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                style={getButtonStyles.filterInput as React.CSSProperties}
              >
                <option value="">Tất cả trạng thái</option>
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

          

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
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
    </div>
  );
}
