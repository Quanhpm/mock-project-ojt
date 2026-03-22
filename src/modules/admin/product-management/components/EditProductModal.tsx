import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Product, ProductUpdatePayload } from "../../../../types/product.types";
import { useUpdateProduct } from "./hooks/useUpdateProduct";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  product: Product | null;
  isLoading?: boolean;
}

interface EditProductFormState {
  SKU: string;
  name: string;
  description: string;
  image_url: string;
  min_price: string;
  max_price: string;
}

interface EditProductFormErrors {
  SKU?: string;
  name?: string;
  min_price?: string;
  max_price?: string;
}

const INITIAL_FORM: EditProductFormState = {
  SKU: "",
  name: "",
  description: "",
  image_url: "",
  min_price: "",
  max_price: "",
};

const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const isValidHttpUrl = (value: string): boolean => {
  if (!value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export default function EditProductModal({
  isOpen,
  onClose,
  onUpdated,
  product,
  isLoading = false,
}: EditProductModalProps) {
  const { updateProduct, isUpdating } = useUpdateProduct();
  const [formValues, setFormValues] = useState<EditProductFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<EditProductFormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      return;
    }

    if (product) {
      setFormValues({
        SKU: product.SKU ?? "",
        name: product.name ?? "",
        description: product.description ?? "",
        image_url: product.image_url ?? "",
        min_price: String(product.min_price ?? ""),
        max_price: String(product.max_price ?? ""),
      });
      setErrors({});
    }
  }, [isOpen, product]);

  const imagePreviewUrl = useMemo(() => {
    return isValidHttpUrl(formValues.image_url) ? formValues.image_url.trim() : "";
  }, [formValues.image_url]);

  const minPriceNumber = Number(formValues.min_price);
  const maxPriceNumber = Number(formValues.max_price);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof EditProductFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: EditProductFormErrors = {};
    const minPrice = Number(formValues.min_price);
    const maxPrice = Number(formValues.max_price);

    if (!formValues.SKU.trim()) {
      validationErrors.SKU = "SKU không được để trống.";
    }

    if (!formValues.name.trim()) {
      validationErrors.name = "Tên sản phẩm không được để trống.";
    }

    if (!Number.isFinite(minPrice) || minPrice <= 0) {
      validationErrors.min_price = "Min Price phải là số lớn hơn 0.";
    }

    if (!Number.isFinite(maxPrice) || maxPrice <= 0) {
      validationErrors.max_price = "Max Price phải là số lớn hơn 0.";
    }

    if (
      Number.isFinite(minPrice) &&
      Number.isFinite(maxPrice) &&
      minPrice > maxPrice
    ) {
      validationErrors.min_price = "Min Price phải nhỏ hơn hoặc bằng Max Price.";
      validationErrors.max_price = "Max Price phải lớn hơn hoặc bằng Min Price.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product || !validateForm()) return;

    const payload: ProductUpdatePayload = {
      SKU: formValues.SKU.trim(),
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      image_url: formValues.image_url.trim(),
      min_price: Number(formValues.min_price),
      max_price: Number(formValues.max_price),
      // PUT endpoints often validate full resource shape. Keep hidden fields from current product.
      content: product.content ?? "",
      images_url: product.images_url ?? [],
      is_have_topping: Boolean(product.is_have_topping),
    };

    const updated = await updateProduct(product.id, payload);
    if (!updated) return;

    if (onUpdated) {
      onUpdated();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        zIndex: 1100,
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
          maxWidth: "760px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 40px rgba(15, 23, 42, 0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
              Edit Product
            </h2>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>
              Cập nhật thông tin cơ bản của sản phẩm.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            style={{
              border: "none",
              background: "transparent",
              cursor: isUpdating ? "not-allowed" : "pointer",
              color: "#64748b",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !product ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
            Đang tải dữ liệu sản phẩm...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  SKU
                </label>
                <input
                  name="SKU"
                  value={formValues.SKU}
                  onChange={handleInputChange}
                  placeholder="VD: COFFEE_01"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    height: "42px",
                    borderRadius: "10px",
                    border: `1px solid ${errors.SKU ? "#ef4444" : "#cbd5e1"}`,
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.SKU && (
                  <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "12px" }}>{errors.SKU}</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  Name
                </label>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Tên sản phẩm"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    height: "42px",
                    borderRadius: "10px",
                    border: `1px solid ${errors.name ? "#ef4444" : "#cbd5e1"}`,
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.name && (
                  <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "12px" }}>{errors.name}</p>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Mô tả chi tiết sản phẩm"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    padding: "10px 12px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  Image URL
                </label>
                <input
                  name="image_url"
                  value={formValues.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    height: "42px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

                {imagePreviewUrl ? (
                  <div
                    style={{
                      marginTop: "10px",
                      width: "84px",
                      height: "84px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      overflow: "hidden",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt="Image preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "12px" }}>
                    Nhập URL hợp lệ để xem preview ảnh.
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  Min Price
                </label>
                <input
                  name="min_price"
                  type="number"
                  min={0}
                  step={1000}
                  value={formValues.min_price}
                  onChange={handleInputChange}
                  placeholder="30000"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    height: "42px",
                    borderRadius: "10px",
                    border: `1px solid ${errors.min_price ? "#ef4444" : "#cbd5e1"}`,
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {Number.isFinite(minPriceNumber) && minPriceNumber > 0 && (
                  <p style={{ margin: "6px 0 0", color: "#475569", fontSize: "12px" }}>
                    {formatCurrency(minPriceNumber)}
                  </p>
                )}
                {errors.min_price && (
                  <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "12px" }}>
                    {errors.min_price}
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  Max Price
                </label>
                <input
                  name="max_price"
                  type="number"
                  min={0}
                  step={1000}
                  value={formValues.max_price}
                  onChange={handleInputChange}
                  placeholder="50000"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    height: "42px",
                    borderRadius: "10px",
                    border: `1px solid ${errors.max_price ? "#ef4444" : "#cbd5e1"}`,
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {Number.isFinite(maxPriceNumber) && maxPriceNumber > 0 && (
                  <p style={{ margin: "6px 0 0", color: "#475569", fontSize: "12px" }}>
                    {formatCurrency(maxPriceNumber)}
                  </p>
                )}
                {errors.max_price && (
                  <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "12px" }}>
                    {errors.max_price}
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                style={{
                  height: "40px",
                  padding: "0 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || isLoading}
                style={{
                  height: "40px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: isUpdating ? "#94a3b8" : "#8B4513",
                  color: "#ffffff",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  minWidth: "120px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isUpdating && (
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.6)",
                      borderTopColor: "#ffffff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                )}
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
