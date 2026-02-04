import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Store } from "lucide-react";
import { useFranchiseStore, type FranchiseCreateInput } from "../hooks/useFranchiseStore.hook";

export default function FranchiseCreatePage() {
  const navigate = useNavigate();

  // ⚠️ create page không filter, ta truyền filter rỗng cho store (hoặc bạn có thể tách store init)
  const { create } = useFranchiseStore({ searchTerm: "", statusFilter: "all" });

  const [formData, setFormData] = useState<FranchiseCreateInput>({
    title: "",
    location: "",
    contact: "",
    status: "draft",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(formData);
    alert("Franchise created successfully!");
    navigate("/admin/franchises");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        <span
          onClick={() => navigate("/admin/franchises")}
          style={{ cursor: "pointer", color: "#8B4513" }}
        >
          Franchises
        </span>{" "}
        › <span style={{ color: "#212529" }}>Create Franchise</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/franchises")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6c757d",
              fontSize: "14px",
            }}
          >
            <ArrowLeft size={18} />
            Back to Franchises
          </button>

          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Create New Franchise
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Add a new franchise with identity and basic contact details.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/franchises")}
            style={{
              padding: "10px 20px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#374151",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-franchise-form"
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
            <Save size={18} />
            Create Franchise
          </button>
        </div>
      </div>

      <form id="create-franchise-form" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Franchise Identity */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <Store size={20} color="#8B4513" />
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Franchise Identity</h2>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Franchise Name *
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter franchise name"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Location *
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter location (e.g., TP.HCM - Quận 1)"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "0px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Contact (Phone/Email) *
                </label>
                <input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  placeholder="Enter contact"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Status */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
                Franchise Status
              </h2>

              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
