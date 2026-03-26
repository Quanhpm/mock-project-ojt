import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Tag } from "lucide-react";
import { useGetVoucherById } from "./hooks/useGetVoucherById";
import { useUpdateVoucher } from "./hooks/useUpdateVoucher";

const updateVoucherSchema = z
  .object({
      name: z.string().min(1, "Promotion name is required"),
      product_franchise_id: z.string().optional(),
      type: z.enum(["FIXED", "PERCENT"]),
      value: z.number().int().min(1, "Minimum is 1"),
      quota_total: z.number().int().min(1, "Minimum is 1"),
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

type UpdateVoucherFormValues = z.infer<typeof updateVoucherSchema>;

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

interface VoucherEditModalProps {
  isOpen: boolean;
  voucherId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VoucherEditModal({
  isOpen,
  voucherId,
  onClose,
  onSuccess,
}: VoucherEditModalProps) {
  const { voucher, fetchById } = useGetVoucherById();
  const { updateVoucher, isUpdating } = useUpdateVoucher();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateVoucherFormValues>({
    resolver: zodResolver(updateVoucherSchema),
  });

  useEffect(() => {
    if (isOpen && voucherId) {
      fetchById(voucherId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, voucherId]);

  useEffect(() => {
    if (voucher && isOpen) {
      reset({
        name: voucher.name,
        type: voucher.type,
        value: voucher.value,
        quota_total: voucher.quota_total,
        start_date: toDatetimeLocal(voucher.start_date),
        end_date: toDatetimeLocal(voucher.end_date),
      });
    }
  }, [voucher, isOpen, reset]);

  const onSubmit = (data: UpdateVoucherFormValues) => {
    updateVoucher(
      voucherId,
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
                Edit Voucher
              </h2>
              {voucher && (
                <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                  Code: {voucher.code || voucher.id}
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
          {(
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Read-only info */}
              {voucher && (
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
                  <p>Franchise ID: <strong>{voucher.franchise_id}</strong></p>
                  <p>{voucher.product_franchise_id && (
                    <>
                    Product Franchise ID: <strong>{voucher.product_franchise_id}</strong>
                    </>
                  )}</p>
                  These fields cannot be changed after creation.
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Name */}
                <div>
                  <label style={labelStyle}>
                    Voucher Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    {...register("name")}
                    placeholder="VD: Mounth april Voucher"
                    style={inputStyle}
                  />
                  {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
                </div>

                {/* Type + Value */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>
                      Discount Type <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select {...register("type")} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="FIXED">FIXED (₫)</option>
                      <option value="PERCENT">PERCENT (%)</option>
                    </select>
                    {errors.type && <p style={errorStyle}>{errors.type.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Value <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      {...register("value", { valueAsNumber: true })}
                      placeholder="0"
                      style={inputStyle}
                    />
                    {errors.value && <p style={errorStyle}>{errors.value.message}</p>}
                  </div>
                </div>

                {/* Quota Total */}
                <div>
                  <label style={labelStyle}>
                    Total Number <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
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
                  Save Changes
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
