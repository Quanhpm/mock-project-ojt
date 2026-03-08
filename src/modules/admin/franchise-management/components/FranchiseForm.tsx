import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, AlertCircle } from "lucide-react";
import { useCreateFranchise } from "./hooks/useCreateFranchise";
import type { Franchise } from "../../../../types/franchise.types";

export default function FranchiseForm() {
  const navigate = useNavigate();
  const { createFranchise, isCreating, error: apiError } = useCreateFranchise();

  const [formData, setFormData] = useState<Omit<Franchise, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>>({
    code: "",
    name: "",
    logo_url: "",
    address: "",
    opened_at: "",
    closed_at: null,
    google_map_script: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) errors.code = "Mã nhượng quyền là bắt buộc";
    if (!formData.name.trim()) errors.name = "Tên nhượng quyền là bắt buộc";
    if (!formData.address.trim()) errors.address = "Địa chỉ là bắt buộc";
    if (!formData.opened_at) errors.opened_at = "Giờ mở cửa là bắt buộc";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Call API
    await createFranchise(formData as any, () => {
      navigate("/admin/franchises");
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field
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

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Franchises › <span style={{ color: "#212529" }}>Tạo Mới Nhượng Quyền</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Tạo Mới Nhượng Quyền
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Thêm một nhượng quyền mới với các thông tin chi tiết.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Franchise Identity Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <MapPin size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Thông Tin Cơ Bản</h2>
              </div>

              {/* Code and Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Mã Nhượng Quyền <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="FR_001"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: formErrors.code ? "1px solid #ef4444" : "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {formErrors.code && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.code}</p>}
                </div>

                {/* Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Tên Nhượng Quyền <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhượng quyền Hà Nội"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: formErrors.name ? "1px solid #ef4444" : "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {formErrors.name && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.name}</p>}
                </div>
              </div>

              {/* Logo URL */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  URL Logo
                </label>
                <input
                  type="text"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.jpg"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Address */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Địa Chỉ <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ nhượng quyền"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: formErrors.address ? "1px solid #ef4444" : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    minHeight: "80px",
                    fontFamily: "inherit"
                  }}
                />
                {formErrors.address && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.address}</p>}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Timing Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Calendar size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Thời Gian Hoạt Động</h2>
              </div>

              {/* Opened Date */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Giờ Mở Cửa <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="time"
                  name="opened_at"
                  value={formData.opened_at}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: formErrors.opened_at ? "1px solid #ef4444" : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                {formErrors.opened_at && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.opened_at}</p>}
              </div>

              {/* Closed Date */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Giờ Đóng Cửa
                </label>
                <input
                  type="time"
                  name="closed_at"
                  value={formData.closed_at || ""}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
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
                  placeholder="Nhập Google Map embed script"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    minHeight: "80px",
                    fontFamily: "monospace"
                  }}
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
                  Kích hoạt nhượng quyền
                </label>
              </div>
            </div>

            {/* Error Display */}
            {apiError && (
              <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", display: "flex", gap: "12px" }}>
                <AlertCircle size={18} color="#dc2626" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#991b1b", margin: "0 0 4px 0" }}>Lỗi</p>
                  <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0 }}>{apiError}</p>
                </div>
              </div>
            )}

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
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCreating}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  backgroundColor: isCreating ? "#d97706" : "#8B5A2B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isCreating ? "not-allowed" : "pointer",
                  opacity: isCreating ? 0.7 : 1,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!isCreating) e.currentTarget.style.backgroundColor = "#7a4a1d";
                }}
                onMouseLeave={(e) => {
                  if (!isCreating) e.currentTarget.style.backgroundColor = "#8B5A2B";
                }}
              >
                {isCreating ? "Đang lưu..." : "Tạo Nhượng Quyền"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
