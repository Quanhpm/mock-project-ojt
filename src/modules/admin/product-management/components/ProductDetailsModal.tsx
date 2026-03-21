import { X } from "lucide-react";
import type { Product } from "../../../../types/product.types";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isLoading?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
};

const cleanHTML = (html: string) => {
  if (!html) return "";
  return html;
};

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  isLoading = false,
}: ProductDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #eee",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            Product Details
          </h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "24px" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              Loading...
            </div>
          ) : product ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "28px",
                alignItems: "start",
              }}
            >
              {/* LEFT IMAGE */}
              <div>
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: "100%",
                      borderRadius: "14px",
                      objectFit: "cover",
                      maxHeight: "420px",
                    }}
                  />
                )}

                {/* THUMBNAILS */}
                {product.images_url && product.images_url.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {product.images_url.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid #eee",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT INFO */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* STATUS */}
                <div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: product.is_active
                        ? "#e6f6ec"
                        : "#ffe9e9",
                      color: product.is_active
                        ? "#16a34a"
                        : "#dc2626",
                    }}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* NAME */}
                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    fontWeight: 700,
                  }}
                >
                  {product.name}
                </h2>

                {/* PRICE */}
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#06b6d4",
                  }}
                >
                  {formatPrice(product.min_price)} –{" "}
                  {formatPrice(product.max_price)}
                </div>

                {/* SMALL CARDS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #eee",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        fontWeight: 600,
                      }}
                    >
                      SKU
                    </div>

                    <div style={{ fontWeight: 600 }}>
                      {product.SKU}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #eee",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        fontWeight: 600,
                      }}
                    >
                      TOPPINGS
                    </div>

                    <div style={{ fontWeight: 600 }}>
                      {product.is_have_topping ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#6b7280",
                      marginBottom: "6px",
                    }}
                  >
                    DESCRIPTION
                  </div>

                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      lineHeight: "1.6",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    {product.description}
                  </div>
                </div>

                {/* CONTENT */}
                {product.content && (
  <div>
    <div
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color: "#6b7280",
        marginBottom: "6px",
      }}
    >
      CONTENT
    </div>

    <div
      className="ck-content-preview"
      style={{
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        maxHeight: "300px",
        overflow: "auto",
        lineHeight: "1.7",
        fontSize: "14px",
        color: "#374151",
      }}
      dangerouslySetInnerHTML={{
        __html: cleanHTML(product.content),
      }}
    />
  </div>
)}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              Product not found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}