import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { useGetLoyaltyRuleById } from "./hooks/useGetLoyaltyRuleById";
import { useUpdateLoyaltyRule } from "./hooks/useUpdateLoyaltyRule";
import { ROUTER_URL } from "@/routes/router.const";

const updateSchema = z.object({
  earn_amount_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
  redeem_value_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
  min_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
  max_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
  description: z.string().optional(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

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

export default function LoyaltyRuleEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loyaltyRule, isLoading, fetchById } = useGetLoyaltyRuleById();
  const { updateLoyaltyRule, isUpdating } = useUpdateLoyaltyRule();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  useEffect(() => {
    if (loyaltyRule) {
      reset({
        earn_amount_per_point: loyaltyRule.earn_amount_per_point,
        redeem_value_per_point: loyaltyRule.redeem_value_per_point,
        min_redeem_points: loyaltyRule.min_redeem_points,
        max_redeem_points: loyaltyRule.max_redeem_points,
        description: loyaltyRule.description,
      });
    }
  }, [loyaltyRule, reset]);

  const onSubmit = (data: UpdateFormValues) => {
    if (!id || !loyaltyRule) return;
    updateLoyaltyRule(
      id,
      {
        franchise_id: loyaltyRule.franchise_id,
        earn_amount_per_point: data.earn_amount_per_point,
        redeem_value_per_point: data.redeem_value_per_point,
        min_redeem_points: data.min_redeem_points,
        max_redeem_points: data.max_redeem_points,
        tier_rules: loyaltyRule.tier_rules,
        description: data.description,
      },
      () => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.LOYALTY}`),
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
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.LOYALTY}`)}
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
            Chỉnh Sửa Loyalty Rule
          </h1>
          {loyaltyRule && <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>ID: {loyaltyRule.id}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {loyaltyRule && (
            <div>
              <label style={labelStyle}>Applicable Franchise</label>
              <input
                disabled
                value={loyaltyRule.franchise_name || loyaltyRule.franchise_id}
                style={{
                  ...inputStyle,
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Earn Amount / Point <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min={1} step={1} {...register("earn_amount_per_point", { valueAsNumber: true })} style={inputStyle} />
              {errors.earn_amount_per_point && <p style={errorStyle}>{errors.earn_amount_per_point.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Redeem Value / Point <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min={1} step={1} {...register("redeem_value_per_point", { valueAsNumber: true })} style={inputStyle} />
              {errors.redeem_value_per_point && <p style={errorStyle}>{errors.redeem_value_per_point.message}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Min Redeem Points <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min={1} step={1} {...register("min_redeem_points", { valueAsNumber: true })} style={inputStyle} />
              {errors.min_redeem_points && <p style={errorStyle}>{errors.min_redeem_points.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Max Redeem Points <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min={1} step={1} {...register("max_redeem_points", { valueAsNumber: true })} style={inputStyle} />
              {errors.max_redeem_points && <p style={errorStyle}>{errors.max_redeem_points.message}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea {...register("description")} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            {errors.description && <p style={errorStyle}>{errors.description.message}</p>}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.LOYALTY}`)}
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
