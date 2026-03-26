import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { useCreateLoyaltyRule } from "./hooks/useCreateLoyaltyRule";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import type { LoyaltyTierRule } from "./loyalty-rule.types";
import { ROUTER_URL } from "@/routes/router.const";

const defaultTierRules: LoyaltyTierRule[] = [
  {
    tier: "BRONZE",
    min_points: 0,
    max_points: 299,
    benefit: { order_discount_percent: 0, earn_multiplier: 1, free_shipping: false },
  },
  {
    tier: "SILVER",
    min_points: 300,
    max_points: 999,
    benefit: { order_discount_percent: 3, earn_multiplier: 1, free_shipping: false },
  },
  {
    tier: "GOLD",
    min_points: 1000,
    max_points: 1999,
    benefit: { order_discount_percent: 5, earn_multiplier: 1.25, free_shipping: false },
  },
  {
    tier: "PLATINUM",
    min_points: 2000,
    benefit: { order_discount_percent: 10, earn_multiplier: 1.5, free_shipping: true },
  },
];

const createSchema = z.object({
  franchise_id: z.string().min(1, "Franchise là bắt buộc"),
  earn_amount_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
  redeem_value_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
  min_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
  max_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
});

type CreateFormValues = z.infer<typeof createSchema>;

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

export default function LoyaltyRuleForm() {
  const navigate = useNavigate();
  const { createLoyaltyRule, isCreating } = useCreateLoyaltyRule();
  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      franchise_id: "",
      earn_amount_per_point: 10000,
      redeem_value_per_point: 1000,
      min_redeem_points: 10,
      max_redeem_points: 500,
      description: "Default loyalty rule based on customer points",
    },
  });

  useEffect(() => {
    franchiseApi
      .searchFranchises({
        searchCondition: { is_deleted: false, is_active: true },
        pageInfo: { pageNum: 1, pageSize: 100 },
      })
      .then((res) => setFranchises(res?.data ?? []))
      .catch(() => setFranchises([]));
  }, []);

  const onSubmit = (data: CreateFormValues) => {
    createLoyaltyRule(
      {
        franchise_id: data.franchise_id,
        earn_amount_per_point: data.earn_amount_per_point,
        redeem_value_per_point: data.redeem_value_per_point,
        min_redeem_points: data.min_redeem_points,
        max_redeem_points: data.max_redeem_points,
        tier_rules: defaultTierRules,
        description: data.description,
      },
      () => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.LOYALTY}`),
    );
  };

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
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#111827" }}>
          Tạo Loyalty Rule Mới
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Franchise <span style={{ color: "#ef4444" }}>*</span></label>
            <select {...register("franchise_id")} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">-- Chọn franchise --</option>
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {errors.franchise_id && <p style={errorStyle}>{errors.franchise_id.message}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
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
            {isCreating && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            Tạo Loyalty Rule
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
