import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useCreatePromotion } from "./hooks/useCreatePromotion";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import { searchProductFranchises, type ProductFranchiseItem } from "@/apis/endpoints/product-franchise.api";
import { useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";

const createPromotionSchema = z
  .object({
    name: z.string().min(1, "Promotion name is required"),
    franchise_id: z.string().min(1, "Franchise is required"),
    product_franchise_id: z.string().optional(),
    type: z.enum(["FIXED", "PERCENT"]),
    value: z.number("Must be a number").int("Must be an integer").min(1, "Minimum is 1"),
    quota_total: z.number("Must be a number").int("Must be an integer").min(1, "Minimum is 1"),
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


export default function PromotionCreateModal() {
  const { createPromotion, isCreating } = useCreatePromotion();
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [productFranchises, setProductFranchises] = useState<ProductFranchiseItem[]>([]);
  const [franchisesLoading, setFranchisesLoading] = useState(false);
  const [pfLoading, setPfLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePromotionFormValues>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      name: "",
      franchise_id: "",
      product_franchise_id: "",
      type: "FIXED",
      value: undefined,
      quota_total: undefined,
      start_date: "",
      end_date: "",
    },
  });

  const selectedFranchiseId = watch("franchise_id");



  // Load franchises khi mở modal
  useEffect(() => {
    setFranchisesLoading(true);
    franchiseApi
      .searchFranchises({
        searchCondition: { is_deleted: false, is_active: true },
        pageInfo: { pageNum: 1, pageSize: 100 },
      })
      .then((res) => setFranchises(res?.data ?? []))
      .catch(() => setFranchises([]))
      .finally(() => setFranchisesLoading(false));
  }, []);

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
        quota_total: data.quota_total,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      () => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.PROMOTION}`)
    );
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#f9f7f4", padding: "clamp(16px, 4vw, 48px) 16px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "700px", width: "100%", margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#7F5539", margin: 0 }}>
            Create New Promotion
          </h1>
          <p style={{ fontSize: "14px", color: "#9C6644", marginTop: "8px" }}>
            Add a new promotion to your franchise promotion
          </p>
        </div>

        {/* FORM CARD */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #E6CCB2",
            boxShadow: "0 4px 6px rgba(127, 85, 57, 0.08)",
            padding: "32px",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>
                  Promotion Name <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. April Special Offer"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#B08968";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#DDB892";
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                  }}
                />
                {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
              </div>

              {/* Franchise */}
              <div>
                <label style={labelStyle}>
                  Franchise <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  {...register("franchise_id")}
                  disabled={franchisesLoading}
                  style={{
                    ...inputStyle,
                    cursor: franchisesLoading ? "wait" : "pointer",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#B08968";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#DDB892";
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                  }}
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
                <label style={labelStyle}>Products (Optional)</label>
                <select
                  {...register("product_franchise_id")}
                  disabled={!selectedFranchiseId || pfLoading}
                  style={{
                    ...inputStyle,
                    cursor: !selectedFranchiseId || pfLoading ? "not-allowed" : "pointer",
                    opacity: !selectedFranchiseId ? 0.6 : 1,
                  }}
                  onFocus={(e) => {
                    if (selectedFranchiseId && !pfLoading) {
                      e.currentTarget.style.borderColor = "#B08968";
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#DDB892";
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                  }}
                >
                  <option value="">
                    {pfLoading
                      ? "Loading..."
                      : !selectedFranchiseId
                        ? "Select franchise first"
                        : "-- Applicable to all products --"}
                  </option>
                  {productFranchises.map((pf) => (
                    <option key={pf.id} value={pf.id}>
                     {pf.product_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type + Value */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>
                    Discount Type <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    {...register("type")}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#B08968";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#DDB892";
                      e.currentTarget.style.backgroundColor = "#faf8f6";
                    }}
                  >
                    <option value="FIXED">FIXED (₫)</option>
                    <option value="PERCENT">PERCENT (%)</option>
                  </select>
                  {errors.type && <p style={errorStyle}>{errors.type.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>
                    Value <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("value", { valueAsNumber: true })}
                    placeholder="0"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#B08968";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#DDB892";
                      e.currentTarget.style.backgroundColor = "#faf8f6";
                    }}
                  />
                  {errors.value && <p style={errorStyle}>{errors.value.message}</p>}
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Total quota <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  {...register("quota_total", { valueAsNumber: true })}
                  placeholder="100"
                  style={inputStyle}
                />
                {errors.quota_total && <p style={errorStyle}>{errors.quota_total.message}</p>}
              </div>

              {/* Date range */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>
                    Start Date <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register("start_date")}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#B08968";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#DDB892";
                      e.currentTarget.style.backgroundColor = "#faf8f6";
                    }}
                  />
                  {errors.start_date && <p style={errorStyle}>{errors.start_date.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>
                    End Date <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register("end_date")}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#B08968";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#DDB892";
                      e.currentTarget.style.backgroundColor = "#faf8f6";
                    }}
                  />
                  {errors.end_date && <p style={errorStyle}>{errors.end_date.message}</p>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid #E6CCB2",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.PROMOTION}`)}
                disabled={isCreating}
                style={{
                  padding: "11px 24px",
                  border: "1px solid #DDB892",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isCreating ? "not-allowed" : "pointer",
                  backgroundColor: "white",
                  color: "#7F5539",
                  transition: "all 0.2s",
                  marginRight: "auto",
                }}
                onMouseEnter={(e) => {
                  if (!isCreating) {
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                    e.currentTarget.style.borderColor = "#B08968";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#DDB892";
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
                  padding: "11px 28px",
                  backgroundColor: isCreating ? "#B08968" : "#7F5539",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isCreating ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isCreating) {
                    e.currentTarget.style.backgroundColor = "#9C6644";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#7F5539";
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
