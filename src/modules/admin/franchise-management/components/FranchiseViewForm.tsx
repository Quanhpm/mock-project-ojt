import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, AlertCircle, Loader, Edit2, ArrowLeft } from "lucide-react";
import { useGetFranchiseById } from "./hooks/useGetFranchiseById";
import FranchiseEditModal from "./FranchiseEditModal";

export default function FranchiseViewForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { franchise, isLoading: isFetching, error, fetchFranchise } = useGetFranchiseById();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // Load franchise data on component mount
  React.useEffect(() => {
    if (id) {
      fetchFranchise(id);
    }
  }, [id, fetchFranchise]);

  if (isFetching) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", backgroundColor: "#f8f9fa", padding: "24px" }}>
        <div style={{ textAlign: "center" }}>
          <Loader size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: "16px", color: "#6c757d" }}>Đang tải thông tin nhượng quyền...</p>
        </div>
      </div>
    );
  }

  if (error || !franchise) {
    return (
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100dvh", padding: "16px" }}>
        <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
          <button 
            onClick={() => navigate("/admin/franchises")}
            style={{ background: "none", border: "none", color: "#0066cc", cursor: "pointer", fontSize: "14px" }}
          >
            ← Quay lại
          </button>
        </div>
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", display: "flex", gap: "12px" }}>
          <AlertCircle size={18} color="#dc2626" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#991b1b", margin: "0 0 4px 0" }}>Lỗi</p>
            <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0 }}>{error || "Không thể tải thông tin nhượng quyền"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100dvh", padding: "16px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Franchises › <span style={{ color: "#212529" }}>Chi Tiết Nhượng Quyền</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            {franchise.name}
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            ID: {franchise.id} • Mã: {franchise.code}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <button
            onClick={() => navigate("/admin/franchises")}
            style={{
              width: "100%",
              padding: "10px 16px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            style={{
              padding: "10px 16px",
              backgroundColor: "#8B5A2B",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#7a4a1d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#8B5A2B";
            }}
          >
            <Edit2 size={16} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Basic Information Section */}
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <MapPin size={18} color="#8B4513" />
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Thông Tin Cơ Bản</h2>
            </div>

            {/* Logo Preview */}
            {franchise.logo_url && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>Logo</p>
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "8px",
                    backgroundImage: `url('${franchise.logo_url}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f3f4f6",
                  }}
                />
              </div>
            )}

            {/* Code */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>Mã Nhượng Quyền</p>
              <p style={{ fontSize: "15px", color: "#1f2937", margin: 0, fontWeight: "500" }}>{franchise.code}</p>
            </div>

            {/* Name */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>Tên Nhượng Quyền</p>
              <p style={{ fontSize: "15px", color: "#1f2937", margin: 0, fontWeight: "500" }}>{franchise.name}</p>
            </div>

            {/* Address */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>Địa Chỉ</p>
              <p style={{ fontSize: "15px", color: "#1f2937", margin: 0, lineHeight: "1.6" }}>{franchise.address}</p>
            </div>

            {/* Logo URL */}
            {franchise.logo_url && (
              <div>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>URL Logo</p>
                <a 
                  href={franchise.logo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: "14px", 
                    color: "#0066cc", 
                    textDecoration: "none",
                    wordBreak: "break-all"
                  }}
                >
                  {franchise.logo_url}
                </a>
              </div>
            )}
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
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>Giờ Mở Cửa</p>
              <p style={{ fontSize: "15px", color: "#1f2937", margin: 0, fontWeight: "500" }}>
                {franchise.opened_at || '-'}
              </p>
            </div>

            {/* Closed Date */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>Giờ Đóng Cửa</p>
              <p style={{ fontSize: "15px", color: "#1f2937", margin: 0, fontWeight: "500" }}>
                {franchise.closed_at || 'Chưa xác định'}
              </p>
            </div>

            {/* Google Map Script */}
            {franchise.google_map_script && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "8px" }}>Google Map Script</p>
                <div
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "12px",
                    borderRadius: "6px",
                    overflow: "auto",
                    maxHeight: "120px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#1f2937",
                    wordBreak: "break-all"
                  }}
                >
                  {franchise.google_map_script}
                </div>
              </div>
            )}

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#f0f4f8", borderRadius: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: franchise.is_active ? "#10b981" : "#ef4444",
                }}
              />
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                {franchise.is_active ? "Đang hoạt động" : "Không hoạt động"}
              </span>
            </div>

            {/* Deleted Status */}
            {franchise.is_deleted && (
              <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", borderLeft: "4px solid #dc2626" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#991b1b", margin: 0 }}>
                  ⚠ Nhượng quyền này đã bị xóa
                </p>
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 16px 0" }}>Thông Tin Hệ Thống</h2>
            
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "4px" }}>Ngày tạo</p>
              <p style={{ fontSize: "14px", color: "#1f2937", margin: 0 }}>
                {franchise.created_at ? new Date(franchise.created_at).toLocaleString('vi-VN') : '-'}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#6b7280", marginBottom: "4px" }}>Cập nhật lần cuối</p>
              <p style={{ fontSize: "14px", color: "#1f2937", margin: 0 }}>
                {franchise.updated_at ? new Date(franchise.updated_at).toLocaleString('vi-VN') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <FranchiseEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        franchiseId={franchise.id}
        onSuccess={() => { if (id) fetchFranchise(id); }}
      />
    </div>
  );
}
