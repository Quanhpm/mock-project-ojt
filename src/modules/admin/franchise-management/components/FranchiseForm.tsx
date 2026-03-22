import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Calendar } from "lucide-react";
import { useCreateFranchise } from "./hooks/useCreateFranchise";

// ──────── Zod Schema ────────
const franchiseSchema = z.object({
  code:              z.string().min(1, "Franchise code is required"),
  name:              z.string().min(1, "Franchise name is required"),
  hotline:           z.string().min(1, "Hotline is required").length(10, "Hotline must be exactly 10 digits").regex(/^\d+$/, "Hotline must contain only digits"),
  logo_url:          z.string().optional(),
  address:           z.string().min(1, "Address is required"),
  opened_at:         z.string().min(1, "Opening time is required"),
  closed_at:         z.string().nullable().optional(),
  google_map_script: z.string().optional(),
  is_active:         z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.opened_at && data.closed_at && data.opened_at >= data.closed_at) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Opened time must be before closed time",
      path: ["opened_at"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Closed time must be after opened time",
      path: ["closed_at"],
    });
  }
});

type FranchiseFormValues = z.infer<typeof franchiseSchema>;

// ──────── Shared Styles ────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid #ef4444",
};

const errStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#ef4444",
  margin: "4px 0 0 0",
};

export default function FranchiseForm() {
  const navigate = useNavigate();
  const { createFranchise, isCreating } = useCreateFranchise();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FranchiseFormValues>({
    resolver: zodResolver(franchiseSchema),
    mode: "onChange",
    defaultValues: {
      code:              "",
      name:              "",
      hotline:           "",
      logo_url:          "",
      address:           "",
      opened_at:         "",
      closed_at:         null,
      google_map_script: "",
      is_active:         true,
    },
  });

  const onSubmit = async (data: FranchiseFormValues) => {
    await createFranchise(
      {
        code:              data.code,
        name:              data.name,
        hotline:           data.hotline,
        logo_url:          data.logo_url ?? "",
        address:           data.address,
        opened_at:         data.opened_at,
        closed_at:         data.closed_at ?? null,
        google_map_script: data.google_map_script ?? "",
        is_active:         data.is_active ?? true,
      },
      () => {
        navigate("/admin/franchises");
      },
    );
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Franchises &rsaquo; <span style={{ color: "#212529" }}>Create New Franchise</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Create New Franchise
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Add a new franchise location with its details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* ──── Left Column ──── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Basic Information Card */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <MapPin size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Basic Information</h2>
              </div>

              {/* Code and Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Franchise Code <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    {...register("code")}
                    placeholder="FR_001"
                    style={errors.code ? inputErrorStyle : inputStyle}
                  />
                  {errors.code && <p style={errStyle}>{errors.code.message}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Franchise Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Hanoi Franchise"
                    style={errors.name ? inputErrorStyle : inputStyle}
                  />
                  {errors.name && <p style={errStyle}>{errors.name.message}</p>}
                </div>
              </div>

              {/* Hotline */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Hotline <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  {...register("hotline")}
                  placeholder="0123456789"
                  maxLength={10}
                  style={errors.hotline ? inputErrorStyle : inputStyle}
                />
                {errors.hotline && <p style={errStyle}>{errors.hotline.message}</p>}
              </div>

              {/* Logo URL */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Logo URL
                </label>
                <input
                  {...register("logo_url")}
                  placeholder="https://example.com/logo.jpg"
                  style={inputStyle}
                />
              </div>

              {/* Address */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  {...register("address")}
                  placeholder="Enter franchise address"
                  style={{
                    ...inputStyle,
                    ...(errors.address ? { border: "1px solid #ef4444" } : {}),
                    minHeight: "80px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
                {errors.address && <p style={errStyle}>{errors.address.message}</p>}
              </div>
            </div>
          </div>

          {/* ──── Right Column ──── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Operating Hours Card */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Calendar size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Operating Hours</h2>
              </div>

              {/* Opening Time */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Opening Time <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="time"
                  {...register("opened_at")}
                  style={errors.opened_at ? inputErrorStyle : inputStyle}
                />
                {errors.opened_at && <p style={errStyle}>{errors.opened_at.message}</p>}
              </div>

              {/* Closing Time */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Closing Time
                </label>
                <input
                  type="time"
                  {...register("closed_at")}
                  style={errors.closed_at ? inputErrorStyle : inputStyle}
                />
                {errors.closed_at && <p style={errStyle}>{errors.closed_at.message}</p>}
              </div>

              {/* Google Map Script */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Google Map Script
                </label>
                <textarea
                  {...register("google_map_script")}
                  placeholder="Enter Google Map embed script"
                  style={{
                    ...inputStyle,
                    minHeight: "80px",
                    resize: "vertical",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              {/* Active Status */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#f0f4f8", borderRadius: "8px" }}>
                <input
                  type="checkbox"
                  id="is_active"
                  {...register("is_active")}
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="is_active" style={{ cursor: "pointer", fontSize: "14px", fontWeight: "500", margin: 0 }}>
                  Active Franchise
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button
                type="button"
                onClick={() => navigate("/admin/franchises")}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e5e7eb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                style={{
                  padding: "12px 20px",
                  backgroundColor: isCreating ? "#d97706" : "#8B5A2B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isCreating ? "not-allowed" : "pointer",
                  opacity: isCreating ? 0.7 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (!isCreating) e.currentTarget.style.backgroundColor = "#7a4a1d"; }}
                onMouseLeave={(e) => { if (!isCreating) e.currentTarget.style.backgroundColor = "#8B5A2B"; }}
              >
                {isCreating ? "Creating..." : "Create Franchise"}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
