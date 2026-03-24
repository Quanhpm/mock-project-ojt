import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, RotateCcw, Eye, FolderPlus, AlertTriangle, X } from "lucide-react";
import { useCategorySearch } from "../hooks/useCategorySearch.hook";
import { useDeleteCategory } from "./hooks/useDeleteCategory";
import { useRestoreCategory } from "./hooks/useRestoreCategory";
import { useToggleStatus } from "./hooks/useToggleStatus";
import { ROUTER_URL } from "@/routes/router.const";
import CategoryEditDrawer from "./CategoryEditDrawer";
import MasterCategoryCreateDrawer from "./MasterCategoryCreateDrawer";
import type { CategoryFranchise } from "../api/category-franchise.types";
import {
  getTableScope,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { getFranchisesForSelect, type FranchiseSelectItem } from "@/apis/endpoints/user.api";

// Add CSS keyframes for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;
if (!document.head.querySelector("style[data-category-table]")) {
  styleSheet.setAttribute("data-category-table", "true");
  document.head.appendChild(styleSheet);
}

// ============================================================================
// TYPES
// ============================================================================

interface DeleteModal {
  isOpen: boolean;
  categoryId: string;
  categoryName: string;
}

interface EditModal {
  isOpen: boolean;
  categoryId: string;
}

interface CreateMasterModal {
  isOpen: boolean;
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
    padding: "16px 20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
  },
  tableContainer: {
    flex: 1,
    display: "flex" as const,
    flexDirection: "column" as const,
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden" as const,
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

export default function CategoryTable() {
  const navigate = useNavigate();
  const tableScope = useAdminAuthStore((state) => getTableScope(state));
  const isGlobalScope = tableScope === "GLOBAL_TABLE_SCOPE";
  const [franchiseOptions, setFranchiseOptions] = useState<FranchiseSelectItem[]>([]);

  // ========================================================================
  // SEARCH HOOK
  // ========================================================================
  const {
    data: categories,
    isLoading,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    refetch,
    executeSearch,
  } = useCategorySearch({ tableScope });

  // Refs for search functionality
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ========================================================================
  // OTHER CUSTOM HOOKS
  // ========================================================================
  const { deleteCategory, isDeleting } = useDeleteCategory();
  const { restoreCategory, isRestoring } = useRestoreCategory();
  const { toggleStatus, isToggling } = useToggleStatus();

  // ========================================================================
  // LOCAL STATE
  // ========================================================================
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    isOpen: false,
    categoryId: "",
    categoryName: "",
  });

  const [editModal, setEditModal] = useState<EditModal>({
    isOpen: false,
    categoryId: "",
  });

  const [createMasterModal, setCreateMasterModal] = useState<CreateMasterModal>({
    isOpen: false,
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

  // Auto-correct currentPage if it exceeds totalPages after deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  // Keyboard shortcuts (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isGlobalScope) {
      setFranchiseOptions([]);
      return;
    }

    const loadFranchises = async () => {
      try {
        const result = await getFranchisesForSelect();
        setFranchiseOptions(result ?? []);
      } catch (error) {
        console.error("Failed to load franchise select items:", error);
      }
    };

    void loadFranchises();
  }, [isGlobalScope]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleStatusFilterChange = (value: string) => {
    const is_active = value === "" ? "" : value === "true";
    setFilters((prev) => ({ ...prev, is_active }));
    setCurrentPage(1);
    void executeSearch({ is_active, page: 1 } as never);
  };

  const handleViewProducts = (category: CategoryFranchise) => {
    navigate(
      `/admin/${ROUTER_URL.ADMIN_ROUTER.CATEGORY}/${category.id}/products`,
      {
        state: {
          categoryFranchiseId: category.id,
          categoryId: category.category_id,
          categoryName: category.category_name,
          franchiseId: category.franchise_id,
        },
      }
    );
  };

  const handleEdit = (id: string) => {
    setEditModal({
      isOpen: true,
      categoryId: id,
    });
  };

  const handleCloseEditModal = () => {
    setEditModal({
      isOpen: false,
      categoryId: "",
    });
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (category: CategoryFranchise) => {
    setDeleteModal({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.category_name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;

    try {
      await deleteCategory(deleteModal.categoryId);
      setDeleteModal({ isOpen: false, categoryId: "", categoryName: "" });
      
      // If deleting the last item on current page (not page 1), go to previous page
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      refetch();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, categoryId: "", categoryName: "" });
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreCategory(id);
      refetch();
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handleToggleCategoryStatus = async (category: CategoryFranchise) => {
    try {
      await toggleStatus(category.id, category.is_active);
      refetch();
    } catch (error) {
      console.error("Toggle status failed:", error);
    }
  };

  const handleCreateNew = () => {
    navigate(
      `/admin/${ROUTER_URL.ADMIN_ROUTER.CATEGORY}/assign${
        isGlobalScope && filters.franchise_id
          ? `?franchise_id=${filters.franchise_id}`
          : ""
      }`
    );
  };

  const handleCreateMaster = () => {
    setCreateMasterModal({ isOpen: true });
  };

  const handleCloseMasterModal = () => {
    setCreateMasterModal({ isOpen: false });
  };

  const handleMasterCreateSuccess = () => {
    setCurrentPage(1); // Reset to first page (will auto-trigger refetch via hook)
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.main}>
        {/* Top Header & Breadcrumbs */}
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
                Categories
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
                Category Management
              </h1>
              <p style={{ color: "#391b03", margin: 0, fontSize: "15px" }}>
                Total Categories: {totalItems || 0}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleCreateMaster}
                style={{
                  ...getButtonStyles.primary,
                  backgroundColor: "#614309",
                  boxShadow: "0 2px 4px rgba(65, 38, 3, 0.3)",
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3e1b04";
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(65, 38, 3, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#614309";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(65, 38, 3, 0.3)";
                }}
                title="Create Master Category"
              >
                <FolderPlus size={18} />
                <span>Create Master Category</span>
              </button>
              <button
                onClick={handleCreateNew}
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
                <span>Assign Category</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {/* Filters */}
          <div style={styles.filterContainer}>
            {/* Row 1: Search input + Search button */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              {/* Search Bar */}
              <div style={{ flex: 1, position: "relative" }}>
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
                  placeholder="Search by title or location..."
                  value={filters.keyword}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      keyword: e.target.value,
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setCurrentPage(1);
                      void executeSearch({ page: 1 });
                    }
                  }}
                  onFocusCapture={(e) => {
                    e.currentTarget.style.borderColor = "#8B5A2B";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    paddingLeft: "40px",
                    paddingRight: filters.keyword ? "40px" : "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    backgroundColor: "#f9fafb",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />

                {/* Clear Button */}
                {filters.keyword && (
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, keyword: "" }));
                      searchInputRef.current?.focus();
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#bdbdbd";
                      e.currentTarget.style.color = "#212529";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#e0e0e0";
                      e.currentTarget.style.color = "#6c757d";
                    }}
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

              {/* Search Button */}
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  void executeSearch({ page: 1 });
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#6d4423";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#8B5A2B";
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#8B5A2B",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  height: "42px",
                }}
              >
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
              </button>
            </div>

            {/* Row 2: Filter dropdowns + Clear button */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
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
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              {isGlobalScope && (
                <select
                  value={filters.franchise_id || ""}
                  onChange={(e) => {
                    const franchise_id = e.target.value;
                    setFilters((prev) => ({ ...prev, franchise_id }));
                    setCurrentPage(1);
                    void executeSearch({ franchise_id, page: 1 } as never);
                  }}
                  style={{
                    padding: "9px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                    outline: "none",
                    minWidth: "200px",
                  }}
                >
                  <option value="">All Franchise</option>
                  {franchiseOptions.map((franchise) => (
                    <option key={franchise.value} value={franchise.value}>
                      {franchise.name}
                    </option>
                  ))}
                </select>
              )}

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
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                {filters.is_deleted ? "Deleted" : "Current"}
              </button>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    keyword: "",
                    franchise_id: "",
                    is_active: "",
                    is_deleted: false,
                  }));
                  setCurrentPage(1);
                  void executeSearch({ keyword: "", franchise_id: "", is_active: "", is_deleted: false, page: 1 } as never);
                  searchInputRef.current?.focus();
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
            </div>
          </div>

          {/* Table */}
          <div style={styles.tableContainer}>
            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
            {!isLoading && categories.length === 0 ? (
              <div
                style={{
                  padding: "80px 20px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ margin: "0 auto 16px", opacity: 0.3 }}
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                  No categories found
                </p>
                <p style={{ fontSize: "14px", opacity: 0.8 }}>
                  Click "Create Category" to add a new category
                </p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th
                      style={{
                        padding: "18px 20px",
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#374151",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "70px",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#374151",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Category
                    </th>
                    {isGlobalScope && (
                      <th
                        style={{
                          padding: "18px 20px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#374151",
                          fontSize: "13px",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}
                      >
                        Franchise
                      </th>
                    )}
                    <th
                      style={{
                        padding: "18px 20px",
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#374151",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "120px",
                      }}
                    >
                      Order
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#374151",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "140px",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        textAlign: "right",
                        fontWeight: "700",
                        color: "#374151",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "150px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f8f9fa" }}>
                          <td colSpan={6} style={{ padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "6px",
                                  backgroundColor: "#e0e0e0",
                                  animation: "pulse 1.5s ease-in-out infinite",
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    height: "16px",
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: "4px",
                                    marginBottom: "8px",
                                    width: "60%",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                  }}
                                />
                                <div
                                  style={{
                                    height: "12px",
                                    backgroundColor: "#f0f0f0",
                                    borderRadius: "4px",
                                    width: "40%",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    : categories.map((category, index) => (
                    <tr
                      key={category.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "18px 20px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td style={{ padding: "18px 20px" }}>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#1f2937",
                            fontSize: "15px",
                          }}
                        >
                          {category.category_name}
                        </div>
                      </td>
                      {isGlobalScope && (
                        <td style={{ padding: "18px 20px" }}>
                          <div style={{ color: "#475569", fontSize: "14px" }}>
                            {category.franchise_name}
                          </div>
                        </td>
                      )}
                      <td style={{ padding: "18px 20px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            fontWeight: "700",
                            fontSize: "15px",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            minWidth: "44px",
                          }}
                        >
                          {category.display_order}
                        </div>
                      </td>
                      <td style={{ padding: "18px 20px", textAlign: "center" }}>
                        <label style={getButtonStyles.toggleSwitch as React.CSSProperties}>
                          <input
                            type="checkbox"
                            checked={category.is_active}
                            onChange={() => handleToggleCategoryStatus(category)}
                            disabled={isToggling}
                            style={getButtonStyles.toggleInput as React.CSSProperties}
                          />
                          <div
                            style={{
                              width: "44px",
                              height: "24px",
                              backgroundColor: category.is_active ? "#8B5A2B" : "#d1d5db",
                              borderRadius: "12px",
                              transition: "background-color 0.3s",
                              position: "relative",
                              opacity: isToggling ? 0.5 : 1,
                              cursor: isToggling ? "not-allowed" : "pointer",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: "2px",
                                left: category.is_active ? "22px" : "2px",
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
                      <td style={{ padding: "18px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() => handleViewProducts(category)}
                            style={{
                              padding: "8px",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#94a3b8",
                            }}
                            title="View Products"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(51,102,204,0.07)";
                              e.currentTarget.style.color = "#3366cc";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#94a3b8";
                            }}
                          >
                            <Eye size={18} />
                          </button>
                          {!category.is_deleted && (
                          <button
                            onClick={() => handleEdit(category.id)}
                            style={{
                              padding: "8px",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#94a3b8",
                            }}
                            title="Edit"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(139,69,19,0.07)";
                              e.currentTarget.style.color = "#8B4513";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#94a3b8";
                            }}
                          >
                            <Edit2 size={18} />
                          </button>
                          )}
                          <button
                            onClick={() =>
                              category.is_deleted
                                ? handleRestore(category.id)
                                : handleDeleteClick(category)
                            }
                            style={{
                              padding: "8px",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#94a3b8",
                            }}
                            disabled={isDeleting || isRestoring}
                            title={category.is_deleted ? "Restore" : "Delete"}
                            onMouseEnter={(e) => {
                              if (category.is_deleted) {
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
                          >
                            {category.is_deleted ? (
                              <RotateCcw size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                padding: "12px 24px",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: "14px", color: "#64748b" }}>
                Showing{" "}
                <span style={{ fontWeight: "500", color: "#1e293b" }}>
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span style={{ fontWeight: "500", color: "#1e293b" }}>
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: "500", color: "#1e293b" }}>
                  {totalItems}
                </span>{" "}
                results
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: "6px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: currentPage === 1 ? "#cbd5e1" : "#64748b",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderTopLeftRadius: "6px",
                    borderBottomLeftRadius: "6px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {(() => {
                  const pages: (number | "...")[] = [];
                  if (totalPages <= 3) {
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
                      <span key={`e-${idx}`} style={{ padding: "0 4px", fontSize: "14px", color: "#6b7280", display: "inline-flex", alignItems: "center" }}>...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "8px 16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: page === currentPage ? "white" : "#1e293b",
                          backgroundColor: page === currentPage ? "#8B5A2B" : "white",
                          border: "1px solid #e2e8f0",
                          borderLeft: "none",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          minWidth: "40px",
                          textAlign: "center" as const,
                        }}
                        onMouseEnter={(e) => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                        onMouseLeave={(e) => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "white"; }}
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
                  disabled={currentPage >= totalPages}
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color:
                      currentPage >= totalPages ? "#cbd5e1" : "#64748b",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderLeft: "none",
                    borderTopRightRadius: "6px",
                    borderBottomRightRadius: "6px",
                    cursor:
                      currentPage >= totalPages ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>Go to page</span>
                  <input
                    type="number" min={1} max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const n = parseInt(pageInput, 10);
                        if (!isNaN(n) && n >= 1 && n <= totalPages) setCurrentPage(n);
                        setPageInput("");
                      }
                    }}
                    placeholder={String(currentPage)}
                    style={{ width: "52px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center", fontSize: "14px", outline: "none", padding: "0 4px" }}
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Edit Drawer */}
      <CategoryEditDrawer
        categoryId={editModal.categoryId}
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Create Master Category Drawer */}
      <MasterCategoryCreateDrawer
        isOpen={createMasterModal.isOpen}
        onClose={handleCloseMasterModal}
        onSuccess={handleMasterCreateSuccess}
      />

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div
          onClick={handleCloseDeleteModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "480px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    backgroundColor: "#ffebee",
                    padding: "10px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertTriangle size={24} color="#f44336" />
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#212529",
                  }}
                >
                  Delete Category
                </h2>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  color: "#6c757d",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
              <p
                style={{
                  margin: 0,
                  marginBottom: "16px",
                  fontSize: "15px",
                  color: "#495057",
                  lineHeight: "1.6",
                }}
              >
                Are you sure you want to delete this category? This action can be undone.
              </p>
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      textTransform: "uppercase" as const,
                      fontWeight: "600",
                    }}
                  >
                    Category ID
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#212529",
                      fontWeight: "500",
                    }}
                  >
                    #{deleteModal.categoryId}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      textTransform: "uppercase" as const,
                      fontWeight: "600",
                    }}
                  >
                    Category Name
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#212529",
                      fontWeight: "500",
                    }}
                  >
                    {deleteModal.categoryName}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                style={{
                  marginRight: "auto",
                  padding: "10px 20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  backgroundColor: "white",
                  color: "#374151",
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Close
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  backgroundColor: isDeleting ? "#fca5a5" : "#f44336",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isDeleting ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid white",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}