import { 
  customers, 
  mockFranchises,
  customerFranchise
} from "@/mockdata";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerDelete from "./CustomerDelete";

// Helper functions to work with normalized data
const getCustomerFranchiseIds = (customerId: number) => {
  return customerFranchise
    .filter(cf => cf.customer_id === customerId && cf.is_active)
    .map(cf => cf.franchise_id);
};

const getCustomerFranchiseNames = (customerId: number) => {
  const franchiseIds = getCustomerFranchiseIds(customerId);
  return franchiseIds
    .map(id => mockFranchises.find(f => f.id === id)?.name)
    .filter(Boolean);
};

export default function CustomerTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Remove page scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customerId: string; customerName: string }>({
    isOpen: false,
    customerId: "",
    customerName: ""
  });

  const itemsPerPage = 5;

  const filteredCustomers = customers.filter(customer => {
    // Filter by search term (name, email, or phone)
    const matchesSearch = searchTerm === "" || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by franchise
    const customerFranchiseIds = getCustomerFranchiseIds(customer.id);
    const matchesFranchise = franchiseFilter === "all" || 
      customerFranchiseIds.includes(parseInt(franchiseFilter));
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && customer.is_active) ||
      (statusFilter === "inactive" && !customer.is_active);
    
    return matchesSearch && matchesFranchise && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFranchiseFilter("all");
    setStatusFilter("all");
  };

  const handleDeleteClick = (customerId: string, customerName: string) => {
    setDeleteModal({
      isOpen: true,
      customerId,
      customerName
    });
  };

  const handleDeleteConfirm = () => {
    console.log("Delete customer:", deleteModal.customerId);
    alert(`Customer "${deleteModal.customerName}" has been deleted successfully!`);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative" }}>
        {/* Top Header & Breadcrumbs */}
        <header style={{ width: "100%", padding: "32px 40px", display: "flex", flexDirection: "column", gap: "28px", flexShrink: 0, zIndex: 10, backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6c757d" }}>
              <a href="#" style={{ color: "#6c757d", textDecoration: "none", transition: "color 0.2s" }}>
                Home
              </a>
              <span style={{ fontSize: "16px" }}>›</span>
              <span style={{ color: "#212529", fontWeight: "500" }}>Customers</span>
            </nav>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h1 style={{ fontSize: "36px", fontWeight: "900", letterSpacing: "-0.025em", color: "#212529", margin: 0 }}>
                Customer Management
              </h1>
              <p style={{ color: "#6c757d", margin: 0, fontSize: "15px" }}>Total Customers: {customers.length}</p>
            </div>
            <button
              onClick={() => navigate('/admin/customers/create')}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#0066cc",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 102, 204, 0.2)",
                transition: "all 0.2s",
                cursor: "pointer",
                border: "none",
                fontWeight: "700",
                fontSize: "15px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0052a3";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 102, 204, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0066cc";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 102, 204, 0.2)";
              }}
            >
              <span style={{ fontSize: "20px" }}>+</span>
              <span>Create Customer</span>
            </button>
          </div>
        </header>

        {/* Content Area - No Scroll */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 40px 40px", overflow: "hidden" }}>
          {/* Filters & Toolbar - Fixed */}
          <div style={{
            backgroundColor: "white",
            padding: "20px 24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-end",
            gap: "16px",
            flexWrap: "wrap",
            border: "1px solid #e5e7eb"
          }}>
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: "250px" }}>
             
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0066cc"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#d1d5db"}
              />
            </div>

            {/* Franchise Filter */}
            <div style={{ minWidth: "180px" }}>
              
              <select
                value={franchiseFilter}
                onChange={(e) => {
                  setFranchiseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  backgroundColor: "white"
                }}
              >
                <option value="all">All Franchises</option>
                {mockFranchises.map(franchise => (
                  <option key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: "140px" }}>
              
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  backgroundColor: "white"
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || franchiseFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={handleClearFilters}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
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

          {/* Table Container - Scrollable */}
          <div style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            overflow: "auto",
            position: "relative",
            border: "1px solid #e5e7eb"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "15px"
            }}>
              <thead style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                zIndex: 10
              }}>
                <tr>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#374151", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Name
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#374151", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Email
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#374151", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Phone
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#374151", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Franchises
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "700", color: "#374151", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Status
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "center", fontWeight: "700", color: "#374151", whiteSpace: "nowrap", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length > 0 ? (
                  currentCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: index % 2 === 0 ? "white" : "#fafbfc",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f4f8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#fafbfc";
                      }}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={customer.avatar_url}
                            alt={customer.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              objectFit: "cover"
                            }}
                          />
                          <span style={{ fontWeight: "600", color: "#1f2937" }}>
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", color: "#6b7280" }}>
                        {customer.email || "—"}
                      </td>
                      <td style={{ padding: "16px 20px", color: "#6b7280" }}>
                        {customer.phone}
                      </td>
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
                                fontWeight: "600"
                              }}
                            >
                              {franchiseName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "700",
                            backgroundColor: customer.is_active ? "#d1fae5" : "#fee2e2",
                            color: customer.is_active ? "#065f46" : "#7f1d1d"
                          }}
                        >
                          {customer.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => navigate(`/admin/customers/${customer.id}`)}
                            style={{
                              padding: "8px 14px",
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#bfdbfe";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#dbeafe";
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
                            style={{
                              padding: "8px 14px",
                              backgroundColor: "#fef3c7",
                              color: "#92400e",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#fde68a";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fef3c7";
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(customer.id.toString(), customer.name)}
                            style={{
                              padding: "8px 14px",
                              backgroundColor: "#fee2e2",
                              color: "#7f1d1d",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#fecaca";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fee2e2";
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center", color: "#6b7280" }}>
                      <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                        No customers found
                      </div>
                      <p style={{ fontSize: "14px", margin: "0" }}>
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
            <div style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "15px",
              padding: "20px 24px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #e5e7eb"
            }}>
              <span style={{ color: "#6b7280", fontWeight: "600" }}>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
              </span>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontWeight: "600", fontSize: "14px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "10px 18px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: currentPage === 1 ? "#f3f4f6" : "#ffffff",
                      color: currentPage === 1 ? "#9ca3af" : "#0066cc",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontWeight: "700",
                      fontSize: "14px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = "#dbeafe";
                        e.currentTarget.style.borderColor = "#0066cc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "10px 18px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#ffffff",
                      color: currentPage === totalPages ? "#9ca3af" : "#0066cc",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontWeight: "700",
                      fontSize: "14px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = "#dbeafe";
                        e.currentTarget.style.borderColor = "#0066cc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      <CustomerDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, customerId: "", customerName: "" })}
        onConfirm={handleDeleteConfirm}
        customerName={deleteModal.customerName}
        customerId={deleteModal.customerId}
      />
    </div>
  );
}
