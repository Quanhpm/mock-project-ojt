import { X, RotateCcw } from "lucide-react";

interface UserRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetId: string;
  targetName: string;
  isRestoring?: boolean;
}

export const UserRestoreModal = ({
  isOpen,
  onClose,
  onConfirm,
  targetId,
  targetName,
  isRestoring = false,
}: UserRestoreModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
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
          maxWidth: "480px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "#e8f5e9",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <RotateCcw size={24} color="#4caf50" />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "#212529",
              }}
            >
              Restore Item
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6c757d",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "15px",
              color: "#495057",
              lineHeight: "1.6",
            }}
          >
            Are you sure you want to restore this item?
          </p>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                ID
              </span>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#212529",
                  fontWeight: "500",
                }}
              >
                #{targetId}
              </p>
            </div>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Name
              </span>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#212529",
                  fontWeight: "500",
                }}
              >
                {targetName}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={onClose}
            disabled={isRestoring}
            style={{
              padding: "10px 20px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "white",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRestoring}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#4caf50",
              color: "white",
              cursor: "pointer",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {isRestoring ? "Restoring..." : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
};
