import { X, Store } from "lucide-react";

interface Franchise {
  id: number;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
  is_deleted: boolean;
}

interface FranchiseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchises: Franchise[];
  productName: string;
}

export default function FranchiseViewModal({ 
  isOpen, 
  onClose, 
  franchises,
  productName
}: FranchiseViewModalProps) {
  if (!isOpen) return null;

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
            maxWidth: "600px",
            maxHeight: "80vh",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                backgroundColor: "#e7f3ff",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Store size={24} color="#0066cc" />
              </div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#212529"
                }}>
                  Franchises
                </h2>
                <p style={{
                  margin: "2px 0 0 0",
                  fontSize: "13px",
                  color: "#6c757d"
                }}>
                  {productName}
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
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#212529"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#6c757d"}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ 
            padding: "24px", 
            overflowY: "auto",
            flex: 1
          }}>
            {franchises.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {franchises.map((franchise) => (
                  <div
                    key={franchise.id}
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                      <div style={{
                        backgroundColor: "#e7f3ff",
                        padding: "8px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <Store size={20} color="#0066cc" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#212529",
                          marginBottom: "8px"
                        }}>
                          {franchise.name}
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                              fontSize: "12px",
                              color: "#6c757d",
                              fontWeight: "600"
                            }}>
                              📍
                            </span>
                            <span style={{
                              fontSize: "14px",
                              color: "#495057"
                            }}>
                              {franchise.address}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                              fontSize: "12px",
                              color: "#6c757d",
                              fontWeight: "600"
                            }}>
                              🏷️
                            </span>
                            <span style={{
                              fontSize: "14px",
                              color: "#495057"
                            }}>
                              Mã: {franchise.code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#6c757d"
              }}>
                <Store size={48} color="#dee2e6" style={{ marginBottom: "16px" }} />
                <p style={{
                  margin: 0,
                  fontSize: "15px"
                }}>
                  No franchises available for this product
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0
          }}>
            <span style={{
              fontSize: "14px",
              color: "#6c757d"
            }}>
              Total: <strong style={{ color: "#212529" }}>{franchises.length}</strong> franchise{franchises.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: "#8B4513",
                color: "white",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
