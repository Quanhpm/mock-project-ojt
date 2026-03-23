import { useEffect } from "react";
import { X, Tag, Calendar, Hash, Building2, Package, BarChart2, FileText, Loader2 } from "lucide-react";
import { useGetVoucherById } from "./hooks/useGetVoucherById";

interface VoucherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId: string;
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

export default function VoucherDetailsModal({
  isOpen,
  onClose,
  voucherId,
}: VoucherDetailsModalProps) {
  const { voucher, isLoading, fetchById } = useGetVoucherById(voucherId);

  useEffect(() => {
    if (isOpen && voucherId) {
      fetchById(voucherId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, voucherId]);

  if (!isOpen) return null;

  const quotaPercent =
    voucher && voucher.quota_total > 0
      ? Math.round((voucher.quota_used / voucher.quota_total) * 100)
      : 0;

  return (
    <>
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
                Voucher Details
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#6c757d", fontFamily: "monospace" }}>
                {voucher ? (voucher.code || voucher.id) : "…"}
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
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
                gap: "12px",
                color: "#6b7280",
              }}
            >
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>Loading voucher details...</span>
            </div>
          ) : voucher ? (
            <>
          {/* Status badges */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: voucher.is_active ? "#e8f5e9" : "#fce4ec",
                color: voucher.is_active ? "#2e7d32" : "#c62828",
              }}
            >
              {voucher.is_active ? "Active" : "Inactive"}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: voucher.type === "FIXED" ? "#e3f2fd" : "#fff3e0",
                color: voucher.type === "FIXED" ? "#1565c0" : "#e65100",
              }}
            >
              {voucher.type === "FIXED" ? "Fixed (₫)" : "Percent (%)"}
            </span>
            {voucher.is_deleted && (
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
                Deleted
              </span>
            )}
          </div>

          {/* Quota usage bar */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "16px",
              border: "1px solid #e9ecef",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                Usage
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#8B4513" }}>
                {voucher.quota_used} / {voucher.quota_total} uses ({quotaPercent}%)
              </span>
            </div>
            <div
              style={{
                height: "8px",
                backgroundColor: "#e9ecef",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${quotaPercent}%`,
                  backgroundColor:
                    quotaPercent >= 90 ? "#ef4444" : quotaPercent >= 60 ? "#f59e0b" : "#8B4513",
                  borderRadius: "4px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Fields */}
          <Field icon={<Hash size={16} />} label="Voucher Code" value={voucher.code} mono />
          <Field icon={<Tag size={16} />} label="Voucher Name" value={voucher.name} />
          {voucher.description && (
            <Field
              icon={<FileText size={16} />}
              label="Description"
              value={voucher.description}
            />
          )}
          <Field
            icon={<Tag size={16} />}
            label="Discount Value"
            value={formatValue(voucher.type, voucher.value)}
          />
          <Field
            icon={<Building2 size={16} />}
            label="Franchise"
            value={
              voucher.franchise_name
                ? `${voucher.franchise_name}`
                : voucher.franchise_id
            }
          />
          {(voucher.product_name || voucher.product_franchise_id) && (
            <Field
              icon={<Package size={16} />}
              label="Applied Product"
              value={voucher.product_name || voucher.product_franchise_id}
            />
          )}
          <Field
            icon={<BarChart2 size={16} />}
            label="Quota"
            value={`${voucher.quota_used} used / ${voucher.quota_total} total`}
          />
          <Field
            icon={<Calendar size={16} />}
            label="Start Date"
            value={formatDate(voucher.start_date)}
          />
          <Field
            icon={<Calendar size={16} />}
            label="End Date"
            value={formatDate(voucher.end_date)}
          />
          <Field
            icon={<Calendar size={16} />}
            label="Created At"
            value={formatDate(voucher.created_at)}
          />
          <Field
            icon={<Calendar size={16} />}
            label="Last Updated"
            value={formatDate(voucher.updated_at)}
          />
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "flex-start",
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
            Close
          </button>
        </div>
      </div>
    </div>

    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
    </>
  );
}
