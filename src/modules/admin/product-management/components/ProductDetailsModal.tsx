import { X } from "lucide-react";
import type { Product } from "../../../../types/product.types";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isLoading?: boolean;
}

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  isLoading = false,
}: ProductDetailsModalProps) {
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
          justifyContent: "center",
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "24px",
              borderBottom: "1px solid #e0e0e0",
              position: "sticky",
              top: 0,
              backgroundColor: "white",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                margin: 0,
                color: "#212529",
              }}
            >
              Product Details
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6c757d",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px" }}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#6c757d" }}>Loading...</p>
              </div>
            ) : product ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Main Image */}
                {product.image_url && (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        maxHeight: "300px",
                      }}
                    />
                  </div>
                )}

                {/* Product Info Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Product ID */}
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Product ID
                    </label>
                    <p style={{ fontSize: "14px", color: "#212529", margin: 0 }}>
                      {product.id}
                    </p>
                  </div>

                  {/* SKU */}
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      SKU
                    </label>
                    <p style={{ fontSize: "14px", color: "#212529", margin: 0 }}>
                      {product.SKU}
                    </p>
                  </div>

                  {/* Name */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Product Name
                    </label>
                    <p style={{ fontSize: "14px", color: "#212529", margin: 0 }}>
                      {product.name}
                    </p>
                  </div>

                  {/* Min Price */}
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Min Price
                    </label>
                    <p style={{ fontSize: "14px", color: "#212529", margin: 0 }}>
                      {formatPrice(product.min_price)}
                    </p>
                  </div>

                  {/* Max Price */}
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Max Price
                    </label>
                    <p style={{ fontSize: "14px", color: "#212529", margin: 0 }}>
                      {formatPrice(product.max_price)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Status
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: product.is_active ? "#4caf50" : "#ef4444",
                        }}
                      />
                      <p style={{ fontSize: "14px", color: "#212529", margin: 0 }}>
                        {product.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {/* Topping Info */}
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Has Topping
                    </label>
                    <p style={{ fontSize: "14px", color: "#212529", margin: 0 }}>
                      {product.is_have_topping ? "Yes" : "No"}
                    </p>
                  </div>

                  {/* Description */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Description
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#495057",
                        margin: 0,
                        lineHeight: "1.6",
                      }}
                    >
                      {product.description}
                    </p>
                  </div>

                  {/* Content */}
                  {product.content && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6c757d",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Content
                      </label>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#495057",
                          lineHeight: "1.6",
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "6px",
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                        dangerouslySetInnerHTML={{ __html: product.content }}
                      />
                    </div>
                  )}

                  {/* Additional Images */}
                  {product.images_url && product.images_url.length > 0 && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6c757d",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Additional Images
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "8px",
                        }}
                      >
                        {product.images_url.map((imgUrl, idx) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`${product.name} ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#ef4444" }}>Product not found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
                backgroundColor: "white",
                color: "#495057",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#bdbdbd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e0e0e0";
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
