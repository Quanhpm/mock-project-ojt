import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Loader, Phone } from "lucide-react";
import { useGetFranchiseById } from "./hooks/useGetFranchiseById";
import { franchiseApi } from "../../../../apis/endpoints/franchise.api";
import type { UpdateFranchiseRequest } from "../../../../apis/endpoints/franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

interface FormData {
  id: number;
  code: string;
  name: string;
  hotline: string;
  logo_url: string;
  address: string;
  opened_at: string;
  closed_at: string | null;
  google_map_script: string;
  is_active: boolean;
}

export default function FranchiseEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { franchise, isLoading: isFetching, fetchFranchise } = useGetFranchiseById();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState<FormData>({
    id: 0,
    code: "",
    name: "",
    hotline: "",
    logo_url: "",
    address: "",
    opened_at: "",
    closed_at: null,
    google_map_script: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Load franchise data on component mount
  useEffect(() => {
    if (id) {
      fetchFranchise(id);
    }
  }, [id, fetchFranchise]);

  // Populate form when franchise data is loaded
  useEffect(() => {
    if (franchise) {
      const f = franchise as any;
      setFormData({
        id: f.id ?? 0,
        code: f.code || "",
        name: f.name || "",
        hotline: f.hotline || "",
        logo_url: f.logo_url || "",
        address: f.address || "",
        opened_at: f.opened_at || "",
        closed_at: f.closed_at || null,
        google_map_script: f.google_map_script || "",
        is_active: f.is_active ?? true,
      });
    }
  }, [franchise]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) errors.code = "Franchise Code is required";
    if (!formData.name.trim()) errors.name = "Franchise Name is required";
    if (!formData.hotline.trim()) errors.hotline = "Hotline is required";
    if (!formData.opened_at) errors.opened_at = "Opening time is required";
    if (!formData.closed_at) errors.closed_at = "Closing time is required";

    if (formData.opened_at && formData.closed_at && formData.opened_at >= formData.closed_at) {
      errors.opened_at = "Opened time must be before closed time";
      errors.closed_at = "Closed time must be after opened time";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUpdating(true);

    try {
      const payload: UpdateFranchiseRequest = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        hotline: formData.hotline.trim(),
        opened_at: formData.opened_at,
        closed_at: formData.closed_at || "",
        logo_url: formData.logo_url.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      const result = await franchiseApi.updateFranchise(String(formData.id), payload);
      if (result) {
        showSuccess?.("Franchise updated successfully!");
        navigate("/admin/franchises");
      } else {
        throw new Error("Update failed – server returned no data.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "An error occurred while updating.";
      showError?.(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    let newValue: any = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const inputStyle = (errorKey?: string): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    border: errorKey && formErrors[errorKey] ? "1px solid #ef4444" : "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  });

  if (isFetching) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <div style={{ textAlign: "center" }}>
          <Loader size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: "16px", color: "#6c757d" }}>Loading franchise information...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Franchises › <span style={{ color: "#212529" }}>Edit Franchise</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Edit Franchise
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            ID: {formData.id}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Basic Info Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <MapPin size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Basic Information</h2>
              </div>

              {/* Code & Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Franchise Code <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="FR_001" style={inputStyle("code")} />
                  {formErrors.code && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.code}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Franchise Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Hanoi Franchise" style={inputStyle("name")} />
                  {formErrors.name && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.name}</p>}
                </div>
              </div>

              {/* Hotline */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  <Phone size={13} /> Hotline <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" name="hotline" value={formData.hotline} onChange={handleChange} placeholder="0123456789" style={inputStyle("hotline")} />
                {formErrors.hotline && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.hotline}</p>}
              </div>

              {/* Logo URL */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Logo URL
                </label>
                <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://example.com/logo.jpg" style={inputStyle()} />
              </div>

              {/* Address */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter franchise address"
                  style={{ ...inputStyle(), minHeight: "80px", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Timing Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Calendar size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Operating Period</h2>
              </div>

              {/* Opened Date */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Opening Time <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="time" name="opened_at" value={formData.opened_at} onChange={handleChange} style={inputStyle("opened_at")} />
                {formErrors.opened_at && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.opened_at}</p>}
              </div>

              {/* Closed Date */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Closing Time <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="time" name="closed_at" value={formData.closed_at || ""} onChange={handleChange} style={inputStyle("closed_at")} />
                {formErrors.closed_at && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.closed_at}</p>}
              </div>

              {/* Google Map Script */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Google Map Script
                </label>
                <textarea
                  name="google_map_script"
                  value={formData.google_map_script || ""}
                  onChange={handleChange}
                  placeholder="Enter Google Map embed script"
                  style={{ ...inputStyle(), minHeight: "80px", fontFamily: "monospace" }}
                />
              </div>

              {/* Active Status */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#f0f4f8", borderRadius: "8px" }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  id="is_active"
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="is_active" style={{ cursor: "pointer", fontSize: "14px", fontWeight: "500", margin: 0 }}>
                  Active Franchise
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => navigate("/admin/franchises")}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e5e7eb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  backgroundColor: isUpdating ? "#d97706" : "#8B5A2B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  opacity: isUpdating ? 0.7 : 1,
                }}
                onMouseEnter={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = "#7a4a1d"; }}
                onMouseLeave={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = "#8B5A2B"; }}
              >
                {isUpdating ? "Saving..." : "Update Franchise"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
