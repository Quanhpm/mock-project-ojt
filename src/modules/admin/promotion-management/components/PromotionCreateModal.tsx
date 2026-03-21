import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Tag } from "lucide-react";
import { useCreatePromotion } from "./hooks/useCreatePromotion";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import { searchProductFranchises, type ProductFranchiseItem } from "@/apis/endpoints/product-franchise.api";

const createPromotionSchema = z
  .object({
    name: z.string().min(1, "Promotion name is required"),
    franchise_id: z.string().min(1, "Franchise is required"),
    product_franchise_id: z.string().optional(),
    type: z.enum(["FIXED", "PERCENT"]),
    value: z.number({ message: "Value must be a number" }),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENT") {
      if (data.value <= 0 || data.value > 100) {
        ctx.addIssue({
          code: "custom",
          message: "Percentage must be between 1 and 100",
          path: ["value"],
        });
      }
    }

    if (data.type === "FIXED") {
      if (data.value < 1000 || data.value > 100000) {
        ctx.addIssue({
          code: "custom",
          message: "Value must be between 1,000 and 100,000 VND",
          path: ["value"],
        });
      }
    }

    // validate date
    if (data.start_date && data.end_date) {
      if (new Date(data.start_date) >= new Date(data.end_date)) {
        ctx.addIssue({
          code: "custom",
          message: "End date must be after start date",
          path: ["end_date"],
        });
      }
    }
  });

type CreatePromotionFormValues = z.infer<typeof createPromotionSchema>;

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "white",
};

const errorStyle: React.CSSProperties = {
  margin: "4px 0 0 0",
  fontSize: "12px",
  color: "#ef4444",
};

interface PromotionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromotionCreateModal({ isOpen, onClose, onSuccess }: PromotionCreateModalProps) {
  const { createPromotion, isCreating } = useCreatePromotion();

  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [productFranchises, setProductFranchises] = useState<ProductFranchiseItem[]>([]);
  const [franchisesLoading, setFranchisesLoading] = useState(false);
  const [pfLoading, setPfLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePromotionFormValues>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      name: "",
      franchise_id: "",
      product_franchise_id: "",
      type: "FIXED",
      value: undefined,
      // quota_total: 1,
      start_date: "",
      end_date: "",
    },
  });

  const selectedFranchiseId = watch("franchise_id");

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      reset();
      setProductFranchises([]);
    }
  }, [isOpen, reset]);

  // Load franchises khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    setFranchisesLoading(true);
    franchiseApi
      .searchFranchises({
        searchCondition: { is_deleted: false, is_active: true },
        pageInfo: { pageNum: 1, pageSize: 100 },
      })
      .then((res) => setFranchises(res?.data ?? []))
      .catch(() => setFranchises([]))
      .finally(() => setFranchisesLoading(false));
  }, [isOpen]);

  // Load product franchises khi chọn franchise
  useEffect(() => {
    if (!selectedFranchiseId) {
      setProductFranchises([]);
      setValue("product_franchise_id", "");
      return;
    }
    setPfLoading(true);
    setValue("product_franchise_id", "");
    searchProductFranchises({
      searchCondition: { franchise_id: selectedFranchiseId, is_deleted: false },
      pageInfo: { pageNum: 1, pageSize: 100 },
    })
      .then((res) => setProductFranchises(res?.data ?? []))
      .catch(() => setProductFranchises([]))
      .finally(() => setPfLoading(false));
  }, [selectedFranchiseId, setValue]);

  const onSubmit = (data: CreatePromotionFormValues) => {
    createPromotion(
      {
        name: data.name,
        franchise_id: data.franchise_id,
        product_franchise_id: data.product_franchise_id || undefined,
        type: data.type,
        value: data.value,
        // quota_total: data.quota_total,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      () => {
        onSuccess();
        onClose();
      },
    );
  };

  if (!isOpen) return null;

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
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
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
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#212529" }}>
              Create Promotion 
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
              color: "#6c757d",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>
                 Promotion Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="VD: Promotion Month 4"
                  style={inputStyle}
                />
                {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
              </div>

              {/* Franchise */}
              <div>
                <label style={labelStyle}>
                  Franchise <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  {...register("franchise_id")}
                  disabled={franchisesLoading}
                  style={{ ...inputStyle, cursor: franchisesLoading ? "wait" : "pointer" }}
                >
                  <option value="">
                    {franchisesLoading ? "Loading..." : "-- Select franchise --"}
                  </option>
                  {franchises.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                {errors.franchise_id && (
                  <p style={errorStyle}>{errors.franchise_id.message}</p>
                )}
              </div>

              {/* Product Franchise */}
              <div>
                <label style={labelStyle}>Products (optional)</label>
                <select
                  {...register("product_franchise_id")}
                  disabled={!selectedFranchiseId || pfLoading}
                  style={{
                    ...inputStyle,
                    cursor: !selectedFranchiseId || pfLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <option value="">
                    {pfLoading
                      ? "Loading..."
                      : !selectedFranchiseId
                        ? "Select franchise first"
                        : "-- Apply to all products --"}
                  </option>
                  {productFranchises.map((pf) => (
                    <option key={pf.id} value={pf.id}>
                      {pf.product_name ?? pf.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type + Value */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>
                    Discount Type <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select {...register("type")} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="FIXED">Fixed (₫)</option>
                    <option value="PERCENT">Percent (%)</option>
                  </select>
                  {errors.type && <p style={errorStyle}>{errors.type.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>
                    Value <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    {...register("value", { valueAsNumber: true })}
                    placeholder="0"
                    style={inputStyle}
                  />
                  {errors.value && <p style={errorStyle}>{errors.value.message}</p>}
                </div>
              </div>

              {/* Date range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>
                    Start date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="datetime-local" {...register("start_date")} style={inputStyle} />
                  {errors.start_date && <p style={errorStyle}>{errors.start_date.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>
                    End date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="datetime-local" {...register("end_date")} style={inputStyle} />
                  {errors.end_date && <p style={errorStyle}>{errors.end_date.message}</p>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
                justifyContent: "flex-end",
                paddingTop: "20px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isCreating ? "not-allowed" : "pointer",
                  backgroundColor: "white",
                  color: "#374151",
                  marginRight: "auto",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  backgroundColor: isCreating ? "#c4956a" : "#8B4513",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isCreating ? "not-allowed" : "pointer",
                }}
              >
                {isCreating && (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                )}
                Create Promotion
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
