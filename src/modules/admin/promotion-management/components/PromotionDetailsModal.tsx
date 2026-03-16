import { X, Tag, Calendar, Building2, Package } from "lucide-react";
import type { Promotion } from "./promotion.types";

interface PromotionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatValue = (type: string, value: number) => {
  if (type === "FIXED") return `${value.toLocaleString("vi-VN")} ₫`;
  return `${value}%`;
};

const Field = ({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "12px 0",
      borderBottom: "1px solid #f5f5f5",
    }}
  >
    <div style={{ color: "#8B4513", marginTop: "2px", flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          color: "#6c757d",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "4px 0 0 0",
          fontSize: "14px",
          color: "#212529",
          fontWeight: "500",
          fontFamily: mono ? "monospace" : undefined,
          wordBreak: "break-all",
        }}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

export default function PromotionDetailsModal({
  isOpen,
  onClose,
  promotion,
}: PromotionDetailsModalProps) {
  if (!isOpen || !promotion) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
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
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          fontFamily: "Inter, sans-serif",
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
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#fdf3eb",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tag size={22} color="#8B4513" />
            </div>
            <div>
              <h2
                style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#212529" }}
              >
                Chi Tiết promotion
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#6c757d", fontFamily: "monospace" }}>
                {promotion.code || promotion.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
          {/* Status badges */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: promotion.is_active ? "#e8f5e9" : "#fce4ec",
                color: promotion.is_active ? "#2e7d32" : "#c62828",
              }}
            >
              {promotion.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: promotion.type === "FIXED" ? "#e3f2fd" : "#fff3e0",
                color: promotion.type === "FIXED" ? "#1565c0" : "#e65100",
              }}
            >
              {promotion.type === "FIXED" ? "Cố định (₫)" : "Phần trăm (%)"}
            </span>
            {promotion.is_deleted && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                }}
              >
                Đã xóa
              </span>
            )}
          </div>

          {/* Fields */}
          <Field
            icon={<Tag size={16} />}
            label="Giá trị giảm"
            value={formatValue(promotion.type, promotion.value)}
          />
          <Field
            icon={<Building2 size={16} />}
            label="Franchise"
            value={
              promotion.franchise_name
                ? `${promotion.franchise_name}`
                : promotion.franchise_id
            }
          />
          {(promotion.product_name || promotion.product_franchise_id) && (
            <Field
              icon={<Package size={16} />}
              label="Sản phẩm áp dụng"
              value={promotion.product_name || promotion.product_franchise_id}
            />
          )}
          <Field
            icon={<Calendar size={16} />}
            label="Ngày bắt đầu"
            value={formatDate(promotion.start_date)}
          />
          <Field
            icon={<Calendar size={16} />}
            label="Ngày kết thúc"
            value={formatDate(promotion.end_date)}
          />
          <Field
            icon={<Calendar size={16} />}
            label="Ngày tạo"
            value={formatDate(promotion.created_at)}
          />
          <Field
            icon={<Calendar size={16} />}
            label="Cập nhật lần cuối"
            value={formatDate(promotion.updated_at)}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#374151",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
