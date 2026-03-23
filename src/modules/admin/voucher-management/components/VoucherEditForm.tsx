import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { useGetVoucherById } from "./hooks/useGetVoucherById";
import { useUpdateVoucher } from "./hooks/useUpdateVoucher";
import { ROUTER_URL } from "@/routes/router.const";

const updateVoucherSchema = z.object({
  name: z.string().min(1, "Tên voucher là bắt buộc"),
  type: z.enum(["FIXED", "PERCENT"]).pipe(z.enum(["FIXED", "PERCENT"])),
  value: z
    .number()
    .positive("Giá trị phải lớn hơn 0"),
  quota_total: z
    .number()
    .int("Số lượng phải là số nguyên")
    .positive("Số lượng phải lớn hơn 0"),
  start_date: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  end_date: z.string().min(1, "Ngày kết thúc là bắt buộc"),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, { message: "Ngày kết thúc phải sau ngày bắt đầu", path: ["end_date"] })
.refine((data) => {
  if (data.type === "PERCENT" && data.value > 100) {
    return false;
  }
  return true;
}, { message: "Phần trăm không được vượt quá 100%", path: ["value"] });

type UpdateVoucherFormValues = z.infer<typeof updateVoucherSchema>;

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

// Convert ISO datetime to datetime-local input format (YYYY-MM-DDTHH:mm)
const toDatetimeLocal = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function VoucherEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { voucher, isLoading, fetchById } = useGetVoucherById(id ?? "");
  const { updateVoucher, isUpdating } = useUpdateVoucher();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateVoucherFormValues>({
    resolver: zodResolver(updateVoucherSchema),
    mode: "onChange",
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

  useEffect(() => {
    if (id) fetchById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (voucher) {
      reset({
        name: voucher.name,
        type: voucher.type,
        value: voucher.value,
        quota_total: voucher.quota_total,
        start_date: toDatetimeLocal(voucher.start_date),
        end_date: toDatetimeLocal(voucher.end_date),
      });
    }
  }, [voucher, reset]);

  const onSubmit = (data: UpdateVoucherFormValues) => {
    if (!id) return;
    updateVoucher(
      id,
      {
        name: data.name,
        type: data.type,
        value: data.value,
        quota_total: data.quota_total,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      () => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.VOUCHER}`),
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px", gap: "12px", color: "#6b7280" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span>Đang tải...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "720px", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.VOUCHER}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: "14px",
            color: "#374151",
          }}
        >
          <ArrowLeft size={14} />
          Quay lại
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#111827" }}>
            Chỉnh Sửa Voucher
          </h1>
          {voucher && (
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
              Mã: {voucher.code || voucher.id}
            </p>
          )}
        </div>
      </div>

      {/* Read-only info */}
      {voucher && (
        <div style={{
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          fontSize: "13px",
          color: "#0369a1",
        }}>
          Franchise ID: <strong>{voucher.franchise_id}</strong>
          {voucher.product_franchise_id && (
            <> · Product Franchise ID: <strong>{voucher.product_franchise_id}</strong></>
          )}
          &nbsp;· Những trường này không thể thay đổi sau khi tạo.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Tên voucher <span style={{ color: "#ef4444" }}>*</span></label>
            <input {...register("name")} placeholder="VD: Voucher KM Tháng 4" style={inputStyle} />
            {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
          </div>

          {/* Type + Value */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Loại giảm giá <span style={{ color: "#ef4444" }}>*</span></label>
              <select {...register("type")} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="FIXED">Cố định (₫)</option>
                <option value="PERCENT">Phần trăm (%)</option>
              </select>
              {errors.type && <p style={errorStyle}>{errors.type.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Giá trị <span style={{ color: "#ef4444" }}>*</span></label>
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
            <label style={labelStyle}>Số lượng tổng <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="text"
              inputMode="numeric"
              {...register("quota_total", { valueAsNumber: true })}
              placeholder="10"
              style={inputStyle}
            />
            {errors.quota_total && <p style={errorStyle}>{errors.quota_total.message}</p>}
          </div>

          {/* Date range */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Ngày bắt đầu <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="datetime-local" {...register("start_date")} style={inputStyle} />
              {errors.start_date && <p style={errorStyle}>{errors.start_date.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Ngày kết thúc <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="datetime-local" {...register("end_date")} style={inputStyle} />
              {errors.end_date && <p style={errorStyle}>{errors.end_date.message}</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.VOUCHER}`)}
            style={{
              padding: "10px 20px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#374151",
            }}
          >
            Hủy
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
            {isUpdating && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            Lưu thay đổi
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
