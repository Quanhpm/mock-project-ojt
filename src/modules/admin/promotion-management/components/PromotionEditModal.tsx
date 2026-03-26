import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Tag } from "lucide-react";
import { useGetPromotionById } from "./hooks/useGetPromotionById";
import { useUpdatePromotion } from "./hooks/useUpdatePromotion";

const updatePromotionSchema = z.object({
    name: z.string().min(1, "Promotion name is required"),
    type: z.enum(["FIXED", "PERCENT"]),
    value: z.number({ message: "Value must be a number" }),
    quota_total: z.number({ message: "Quota total must be a number" }).int().min(1, "Minimum is 1"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
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

    // ✅ validate start_date phải >= hiện tại
    if (data.start_date) {
      const start = new Date(data.start_date);

      if (start < now) {
        ctx.addIssue({
          code: "custom",
          message: "Start date must be in the future",
          path: ["start_date"],
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

type UpdatePromotionFormValues = z.infer<typeof updatePromotionSchema>;

const toDatetimeLocal = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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

interface PromotionEditModalProps {
  isOpen: boolean;
  promotionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromotionEditModal({
  isOpen,
  promotionId,
  onClose,
  onSuccess,
}: PromotionEditModalProps) {
  const { promotion, fetchById } = useGetPromotionById();
  const { updatePromotion, isUpdating } = useUpdatePromotion();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdatePromotionFormValues>({
    resolver: zodResolver(updatePromotionSchema),
  });

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

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    const numValue = rawInput ? parseInt(rawInput, 10) : 0;
    setValue("value", numValue, { shouldValidate: true });
  };

  const getValuePlaceholder = () => {
    return selectedType === "PERCENT" ? "0-100" : "0";
  };

  const getValueSuffix = () => {
    return selectedType === "PERCENT" ? " %" : " VND";
  };

  useEffect(() => {
    if (isOpen && promotionId) {
      fetchById(promotionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, promotionId]);

  useEffect(() => {
    if (promotion && isOpen) {
      reset({
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
        quota_total: promotion.quota_total,
        start_date: toDatetimeLocal(promotion.start_date),
        end_date: toDatetimeLocal(promotion.end_date),
      });
    }
  }, [promotion, isOpen, reset]);

  const onSubmit = (data: UpdatePromotionFormValues) => {
    updatePromotion(
      promotionId,
      {
        name: data.name,
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
          width: "min(620px, calc(100vw - 24px))",
          maxHeight: "calc(100dvh - 24px)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#212529" }}>
                Edit Promotion
              </h2>
              {promotion && (
                <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                  Code: {promotion.code || promotion.id}
                </p>
              )}
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
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "clamp(16px, 4vw, 24px)" }}>
          {!promotion ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
                gap: "12px",
                color: "#6b7280",
              }}
            >
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              {/* <span>Loading data...</span> */}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Read-only info */}
              {promotion && (
                <div
                  style={{
                    backgroundColor: "#fdf3eb",
                    border: "1px solid #f5c6a0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "20px",
                    fontSize: "13px",
                    color: "#7c3011",
                  }}
                >
                  Franchise ID: <strong>{promotion.franchise_id}</strong>
                  {promotion.product_franchise_id && (
                    <>
                      {" "}
                      · Product Franchise ID: <strong>{promotion.product_franchise_id}</strong>
                    </>
                  )}
                  &nbsp;· These fields cannot be changed after creation.
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Name */}
                <div>
                  <label style={labelStyle}>
                    Promotion Name<span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    {...register("name")}
                    placeholder="VD: Promotion KM Tháng 4"
                    style={inputStyle}
                  />
                  {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
                </div>

                {/* Type + Value */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>
                      Discount Type<span style={{ color: "#ef4444" }}>*</span>
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
                    Số lượng tổng <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register("quota_total", { valueAsNumber: true })}
                    placeholder="10"
                    style={inputStyle}
                  />
                  {errors.quota_total && <p style={errorStyle}>{errors.quota_total.message}</p>}
                </div>

                {/* Date range */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
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
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUpdating}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: isUpdating ? "not-allowed" : "pointer",
                    backgroundColor: "white",
                    color: "#374151",
                    marginRight: "auto",
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    backgroundColor: isUpdating ? "#c4956a" : "#8B4513",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isUpdating ? "not-allowed" : "pointer",
                  }}
                >
                  {isUpdating && (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  )}
                  Save changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
