import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Save, Store } from "lucide-react";
import { useFranchiseStore, type FranchiseCreateInput } from "../hooks/useFranchiseStore.hook";

export default function FranchiseCreatePage() {
  const navigate = useNavigate();

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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    create(formData);
    alert("Franchise created successfully!");
    navigate("/admin/franchises");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        <button
          type="button"
          onClick={() => navigate("/admin/franchises")}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#8B4513" }}
        >
          Franchises
        </button>{" "}
        › <span style={{ color: "#212529" }}>Create Franchise</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/franchises")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px 0",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6c757d",
              fontSize: "14px"
            }}
          >
            <ArrowLeft size={18} />
            Back to Franchises
          </button>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Create New Franchise
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Add a new franchise with identity and operational settings.
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
              color: "#374151"
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
              gap: "8px"
            }}
          >
            <Save size={18} />
            Create Franchise
          </button>
        </div>
      </div>

      <form id="create-franchise-form" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Store size={18} color="#8B4513" />
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Franchise Identity</h2>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="create-franchise-title" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Franchise Name *
                </label>
                <input
                  id="create-franchise-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter franchise name"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label htmlFor="create-franchise-location" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                    Location *
                  </label>
                  <input
                    id="create-franchise-location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter location"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label htmlFor="create-franchise-contact" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                    Contact *
                  </label>
                  <input
                    id="create-franchise-contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone or email"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <MapPin size={18} color="#8B4513" />
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Status</h2>
              </div>

              <label htmlFor="create-franchise-status" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                Franchise Status
              </label>
              <select
                id="create-franchise-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", backgroundColor: "white" }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Phone size={18} color="#8B4513" />
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Quick Info</h2>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#6c757d", lineHeight: 1.5 }}>
                New franchise will be created with today as initial creation date.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
