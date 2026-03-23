import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Tag } from "lucide-react";
import { useCreateVoucher } from "./hooks/useCreateVoucher";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import { searchProductFranchises, type ProductFranchiseItem } from "@/apis/endpoints/product-franchise.api";

const createVoucherSchema = z
  .object({
    name: z.string().min(1, "Voucher name is required"),
    franchise_id: z.string().min(1, "Franchise is required"),
    product_franchise_id: z.string().optional(),
    type: z.enum(["FIXED", "PERCENT"], { error: "Voucher type is required" }),
    value: z
      .number({ error: "Value must be a number" })
      .positive("Value must be greater than 0"),
    quota_total: z
      .number({ error: "Quota must be a number" })
      .int("Quota must be an integer")
      .positive("Quota must be greater than 0"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) < new Date(data.end_date);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["end_date"] },
  )
  .refine(
    (data) => {
      if (data.type === "PERCENT" && data.value > 100) {
        return false;
      }
      return true;
    },
    { message: "Percentage cannot exceed 100%", path: ["value"] },
  );

type CreateVoucherFormValues = z.infer<typeof createVoucherSchema>;

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

interface VoucherCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VoucherCreateModal({ isOpen, onClose, onSuccess }: VoucherCreateModalProps) {
  const { createVoucher, isCreating } = useCreateVoucher();

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
  } = useForm<CreateVoucherFormValues>({
    resolver: zodResolver(createVoucherSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      franchise_id: "",
      product_franchise_id: "",
      type: "FIXED",
      value: 0,
      quota_total: 1,
      start_date: "",
      end_date: "",
    },
  });

  const selectedFranchiseId = watch("franchise_id");
  const selectedType = watch("type");
  const currentValue = watch("value");

  // Format value display based on type
  const formatValueDisplay = (value: number) => {
    if (selectedType === "PERCENT") {
      return value.toString();
    }
    // FIXED: format as Vietnamese currency
    return value.toLocaleString("vi-VN");
  };

  const getValuePlaceholder = () => {
    return selectedType === "PERCENT" ? "0-100" : "0";
  };

  const getValueSuffix = () => {
    return selectedType === "PERCENT" ? " %" : " VND";
  };

  // Handle value input with formatting
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value.replace(/\D/g, ""); // Remove non-numeric
    const numValue = rawInput ? parseInt(rawInput, 10) : 0;
    setValue("value", numValue, { shouldValidate: true });
  };

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

  const onSubmit = (data: CreateVoucherFormValues) => {
    createVoucher(
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
              Create New Voucher
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
                  Voucher Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. Seasonal Promotion"
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
                <label style={labelStyle}>Product (Optional)</label>
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
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatValueDisplay(currentValue)}
                      onChange={handleValueChange}
                      placeholder={getValuePlaceholder()}
                      style={inputStyle}
                    />
                    <span style={{
                      position: "absolute",
                      right: "12px",
                      color: "#9ca3af",
                      fontSize: "14px",
                      pointerEvents: "none",
                    }}>
                      {getValueSuffix()}
                    </span>
                  </div>
                  {errors.value && <p style={errorStyle}>{errors.value.message}</p>}
                </div>
              </div>

              {/* Quota Total */}
              <div>
                <label style={labelStyle}>
                  Total Quota <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  {...register("quota_total", { valueAsNumber: true })}
                  placeholder="10"
                  style={inputStyle}
                />
                {errors.quota_total && <p style={errorStyle}>{errors.quota_total.message}</p>}
              </div>

              {/* Date range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>
                    Start Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="datetime-local" {...register("start_date")} style={inputStyle} />
                  {errors.start_date && <p style={errorStyle}>{errors.start_date.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>
                    End Date <span style={{ color: "#ef4444" }}>*</span>
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
                Create Voucher
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
