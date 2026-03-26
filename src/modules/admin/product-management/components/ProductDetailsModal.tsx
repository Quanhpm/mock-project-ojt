import { X } from "lucide-react";
import type { Product } from "../../../../types/product.types";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isLoading?: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

const formatPriceRange = (minPrice: number, maxPrice: number) => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }

  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
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
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "12px",
        overflowY: "auto",
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #eee",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
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

        <div style={{ padding: "20px" }}>
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gap: "28px",
                alignItems: "start",
              }}
              className="grid-cols-1 md:grid-cols-2"
            >
              <div>
                <div
                  className="animate-pulse"
                  style={{
                    width: "100%",
                    height: "320px",
                    borderRadius: "14px",
                    background: "#e5e7eb",
                  }}
                />
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse"
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "8px",
                        background: "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div
                  className="animate-pulse"
                  style={{
                    width: "92px",
                    height: "26px",
                    borderRadius: "999px",
                    background: "#e5e7eb",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    width: "70%",
                    height: "34px",
                    borderRadius: "10px",
                    background: "#e5e7eb",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    width: "40%",
                    height: "28px",
                    borderRadius: "10px",
                    background: "#e5e7eb",
                  }}
                />
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                  className="grid-cols-1 sm:grid-cols-2"
                >
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse"
                      style={{
                        height: "72px",
                        borderRadius: "10px",
                        background: "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <div
                  className="animate-pulse"
                  style={{
                    width: "100%",
                    height: "110px",
                    borderRadius: "10px",
                    background: "#e5e7eb",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    width: "100%",
                    height: "180px",
                    borderRadius: "10px",
                    background: "#e5e7eb",
                  }}
                />
              </div>
            </div>
          ) : product ? (
            <div
              style={{
                display: "grid",
                gap: "28px",
                alignItems: "start",
              }}
              className="grid-cols-1 md:grid-cols-2"
            >
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

                {product.images_url && product.images_url.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {product.images_url.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
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

              <div
                style={{ display: "flex", flexDirection: "column", gap: "18px" }}
              >
                <div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: product.is_active ? "#e6f6ec" : "#ffe9e9",
                      color: product.is_active ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    fontWeight: 700,
                  }}
                >
                  {product.name}
                </h2>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#06b6d4",
                  }}
                >
                  {formatPriceRange(product.min_price ?? 0, product.max_price ?? 0)}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                  className="grid-cols-1 sm:grid-cols-2"
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

                    <div style={{ fontWeight: 600 }}>{product.SKU}</div>
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

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
