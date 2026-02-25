import { X, AlertTriangle } from "lucide-react";

interface CustomerDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  customerId: string;
}

export default function CustomerDelete({ 
  isOpen, 
  onClose, 
  onConfirm, 
  customerName,
  customerId 
}: CustomerDeleteProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
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
          justifyContent: "center"
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "480px",
            padding: "32px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            position: "relative"
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#212529";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6c757d";
            }}
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <div style={{
              backgroundColor: "#fff3cd",
              borderRadius: "50%",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <AlertTriangle size={32} style={{ color: "#ff9800" }} />
            </div>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#212529",
            margin: 0,
            marginBottom: "8px",
            textAlign: "center"
          }}>
            Delete Customer
          </h2>

          {/* Description */}
          <p style={{
            fontSize: "14px",
            color: "#6c757d",
            margin: 0,
            marginBottom: "16px",
            textAlign: "center"
          }}>
            Are you sure you want to delete <strong>{customerName}</strong> (ID: {customerId})? This action cannot be undone.
          </p>

          {/* Actions */}
          <div style={{
            display: "flex",
            gap: "12px",
            marginTop: "24px"
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: "white",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#495057",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: "#dc3545",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c82333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#dc3545";
              }}
            >
              Delete Customer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
