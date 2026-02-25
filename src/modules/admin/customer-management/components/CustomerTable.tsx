import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { customers, mockFranchises, customerFranchise } from "@/mockdata";
import CustomerDelete from "./CustomerDelete";

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
// HELPER FUNCTIONS
// ============================================================================

const getCustomerFranchiseIds = (customerId: number): number[] => {
  return customerFranchise
    .filter((cf) => cf.customer_id === customerId && cf.is_active)
    .map((cf) => cf.franchise_id);
};

const getCustomerFranchiseNames = (customerId: number): string[] => {
  const franchiseIds = getCustomerFranchiseIds(customerId);
  return franchiseIds
    .map((id) => mockFranchises.find((f) => f.id === id)?.name)
    .filter(Boolean) as string[];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CustomerTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [customerStatus, setCustomerStatus] = useState<Record<number, boolean>>(
    customers.reduce(
      (acc, customer) => ({
        ...acc,
        [customer.id]: customer.is_active,
      }),
      {}
    )
  );
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    isOpen: false,
    customerId: "",
    customerName: "",
  });

  const itemsPerPage = 5;

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleToggleCustomerStatus = (customerId: number) => {
    setCustomerStatus((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFranchiseFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleDeleteClick = (customerId: string, customerName: string) => {
    setDeleteModal({
      isOpen: true,
      customerId,
      customerName,
    });
  };

  const handleDeleteConfirm = () => {
    alert(`Customer "${deleteModal.customerName}" has been deleted successfully!`);
    setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
  };

  // ========================================================================
  // FILTERS & PAGINATION
  // ========================================================================

  const filteredCustomers = customers.filter((customer) => {
    const currentStatus = customerStatus[customer.id] ?? customer.is_active;
    const customerFranchiseIds = getCustomerFranchiseIds(customer.id);

    const matchesSearch =
      searchTerm === "" ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFranchise =
      franchiseFilter === "all" ||
      customerFranchiseIds.includes(parseInt(franchiseFilter));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && currentStatus) ||
      (statusFilter === "inactive" && !currentStatus);

    return matchesSearch && matchesFranchise && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ========================================================================
  // RENDER - TABLE ROW
  // ========================================================================

  const renderTableRow = (customer: typeof customers[0], index: number) => {
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

        {/* Franchises */}
        <td style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {getCustomerFranchiseNames(customer.id).map((franchiseName, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {franchiseName}
              </span>
            ))}
          </div>
        </td>

        {/* Status Toggle */}
        <td style={{ padding: "16px 20px" }}>
          <label style={getButtonStyles.toggleSwitch as React.CSSProperties}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => handleToggleCustomerStatus(customer.id)}
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
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            {/* View Button */}
            <button
              onClick={() => navigate(`/admin/customers/${customer.id}`)}
              style={{
                ...getButtonStyles.actionButton,
                color: "#4b5563",
              } as React.CSSProperties}
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
              style={{
                ...getButtonStyles.actionButton,
                color: "#4b5563",
              } as React.CSSProperties}
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
              style={{
                ...getButtonStyles.actionButton,
                color: "#4b5563",
              } as React.CSSProperties}
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
            <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6c757d" }}>
              <a href="#" style={{ color: "#6c757d", textDecoration: "none", transition: "color 0.2s" }}>
                Home
              </a>
              <span style={{ fontSize: "16px" }}>›</span>
              <span style={{ color: "#212529", fontWeight: "500" }}>Customers</span>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                Total Customers: {customers.length}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/customers/create")}
              style={getButtonStyles.primary as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#6d4423";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(139, 90, 43, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B5A2B";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(139, 90, 43, 0.2)";
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
            <div style={{ flex: 1, minWidth: "250px" }}>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={getButtonStyles.filterInput as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8B5A2B";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
              />
            </div>

            <div style={{ minWidth: "180px" }}>
              <select
                value={franchiseFilter}
                onChange={(e) => {
                  setFranchiseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={getButtonStyles.filterInput as React.CSSProperties}
              >
                <option value="all">All Franchises</option>
                {mockFranchises.map((franchise) => (
                  <option key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: "140px" }}>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={getButtonStyles.filterInput as React.CSSProperties}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {(searchTerm || franchiseFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={handleClearFilters}
                style={getButtonStyles.clearFilter as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#6b7280", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Name
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#6b7280", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Email
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#6b7280", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Phone
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#6b7280", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Franchises
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#6b7280", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Status
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "right", fontWeight: "700", color: "#6b7280", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length > 0 ? (
                  currentCustomers.map((customer, index) =>
                    renderTableRow(customer, index)
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={6}
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
                      <p style={{ fontSize: "14px", margin: "0", color: "#6b7280" }}>
                        Try adjusting your filters or create a new customer.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.paginationContainer}>
              <span style={{ color: "#6b7280", fontWeight: "600" }}>
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of{" "}
                {filteredCustomers.length} customers
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...getButtonStyles.pagination,
                    backgroundColor:
                      currentPage === 1 ? "#f3f4f6" : "#ffffff",
                    color: currentPage === 1 ? "#9ca3af" : "#374151",
                    cursor:
                      currentPage === 1 ? "not-allowed" : "pointer",
                  } as React.CSSProperties}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        ...getButtonStyles.pagination,
                        backgroundColor:
                          currentPage === page ? "#8B5A2B" : "#ffffff",
                        color: currentPage === page ? "#ffffff" : "#374151",
                        fontWeight:
                          currentPage === page ? ("700" as const) : ("600" as const),
                        minWidth: "40px",
                        textAlign: "center" as const,
                      } as React.CSSProperties}
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
                  )
                )}

                {/* Next Button */}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    ...getButtonStyles.pagination,
                    backgroundColor:
                      currentPage === totalPages ? "#f3f4f6" : "#ffffff",
                    color:
                      currentPage === totalPages ? "#9ca3af" : "#374151",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  } as React.CSSProperties}
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
      />
    </div>
  );
}
