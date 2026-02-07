import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye, EyeOff, Plus, Search } from "lucide-react";

import { useFranchiseFilters } from "../hooks/useFranchiseFilters.hook";
import { useFranchiseStore, type Franchise } from "../hooks/useFranchiseStore.hook";
import { usePaginatedList } from "../hooks/useFranchiseList.hook";

function StatusPill({ status }: { status: Franchise["status"] }) {
  const map: Record<Franchise["status"], { bg: string; color: string; text: string; border: string }> = {
    published: { bg: "#e8f5e9", color: "#2e7d32", text: "Published", border: "#c8e6c9" },
    draft: { bg: "#fff8e1", color: "#f57c00", text: "Draft", border: "#ffecb3" },
    inactive: { bg: "#ffebee", color: "#c62828", text: "Inactive", border: "#ffcdd2" },
  };

  const s = map[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: 600,
        borderRadius: "999px",
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.text}
    </span>
  );
}

export default function FranchiseManagement() {
  const navigate = useNavigate();

  const { filters, setSearchTerm, setStatusFilter, handleClearFilters } = useFranchiseFilters();

  // ✅ store CRUD mock
  const { filtered, toggleStatus, remove } = useFranchiseStore({
    searchTerm: filters.searchTerm,
    statusFilter: filters.statusFilter as "all" | "published" | "draft" | "inactive",
  });

  // ✅ pagination 6 rows / page
  const { pageItems, currentPage, setCurrentPage, totalPages, totalItems } = usePaginatedList(filtered, 6);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.statusFilter, setCurrentPage]);

  const isEmpty = totalItems === 0;

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa franchise này?")) return;
    remove(id);
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb giống ProductActionPage */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        <span onClick={() => navigate("/admin")} style={{ cursor: "pointer", color: "#8B4513" }}>
          Home
        </span>{" "}
        › <span style={{ color: "#212529" }}>Franchises</span>
      </div>

      {/* Header giống style Product */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Franchise Management
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Total Franchises: {totalItems}
          </p>
        </div>

        {/* Create button màu nâu */}
        <button
          type="button"
          onClick={() => navigate("/admin/franchises/create")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            backgroundColor: "#8B4513",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d3610")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B4513")}
        >
          <Plus size={18} />
          Create Franchise
        </button>
      </div>

      {/* Filter bar giống Product list */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} color="#9e9e9e" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={filters.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or location..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <select
          value={filters.statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{
            padding: "10px 12px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "white",
            cursor: "pointer",
            minWidth: "160px",
          }}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          type="button"
          onClick={handleClearFilters}
          style={{
            padding: "10px 16px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#8B4513",
            whiteSpace: "nowrap",
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
                {["FRANCHISE NAME", "LOCATION", "STATUS", "CREATED DATE", "ACTIONS"].map((h, idx) => (
                  <th
                    key={h}
                    style={{
                      textAlign: idx === 4 ? "right" : "left",
                      padding: "16px",
                      fontSize: "12px",
                      color: "#6c757d",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={5} style={{ padding: "28px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#212529" }}>No franchises found</div>
                    <div style={{ fontSize: "14px", color: "#6c757d", marginTop: "6px" }}>
                      Try adjusting filters or create a new franchise.
                    </div>
                    <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        style={{
                          padding: "10px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          cursor: "pointer",
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        Clear Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/admin/franchises/create")}
                        style={{
                          padding: "10px 16px",
                          border: "none",
                          borderRadius: "8px",
                          backgroundColor: "#8B4513",
                          cursor: "pointer",
                          color: "white",
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d3610")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B4513")}
                      >
                        Create Franchise
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pageItems.map((f) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#212529" }}>{f.title}</div>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}>{f.contact}</div>
                    </td>

                    <td style={{ padding: "16px", fontSize: "14px", color: "#212529" }}>{f.location}</td>
                    <td style={{ padding: "16px" }}>
                      <StatusPill status={f.status} />
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#212529" }}>{f.createdAt}</td>

                    {/* Actions: hover màu xanh/đỏ */}
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "12px", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/franchises/${f.id}/edit`)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "6px",
                            borderRadius: "8px",
                            color: "#6c757d",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#1976d2")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#6c757d")}
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStatus(f.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "6px",
                            borderRadius: "8px",
                            color: "#6c757d",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#6c757d")}
                          title={f.status === "inactive" ? "Show" : "Hide"}
                        >
                          {f.status === "inactive" ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "6px",
                            borderRadius: "8px",
                            color: "#6c757d",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#e53935")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#6c757d")}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isEmpty && totalPages > 1 && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color: "#374151",
                }}
              >
                Prev
              </button>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>
                Page <b style={{ color: "#212529" }}>{currentPage}</b> / {totalPages}
              </div>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  backgroundColor: "white",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  color: "#374151",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
