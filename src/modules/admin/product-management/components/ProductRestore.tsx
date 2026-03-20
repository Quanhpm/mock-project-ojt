import { X, RotateCcw } from "lucide-react";

interface ProductRestoreProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  productId: string;
}

export default function ProductRestore({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName,
  productId 
}: ProductRestoreProps) {
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
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                backgroundColor: "#e8f5e9",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <RotateCcw size={24} color="#4caf50" />
              </div>
              <h2 style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "#212529"
              }}>
                Restore Product
              </h2>
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
                color: "#6c757d"
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px" }}>
            <p style={{
              margin: 0,
              marginBottom: "16px",
              fontSize: "15px",
              color: "#495057",
              lineHeight: "1.6"
            }}>
              Are you sure you want to restore this product? It will be visible in your system again.
            </p>
            
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  fontWeight: "600"
                }}>
                  Product ID
                </span>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#212529",
                  fontWeight: "500"
                }}>
                  {productId}
                </p>
              </div>
              <div>
                <span style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  fontWeight: "600"
                }}>
                  Product Name
                </span>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#212529",
                  fontWeight: "500"
                }}>
                  {productName}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            gap: "12px",
            justifyContent: "flex-start"
          }}>
            <button
              onClick={onClose}
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
              Close
            </button>
            <button
              onClick={handleConfirm}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: "#4caf50",
                color: "white"
              }}
            >
              Restore Product
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
