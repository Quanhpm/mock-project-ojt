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
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "white",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid #ef4444",
};

const errStyle: React.CSSProperties = {
  fontSize: "12px",
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
    <div style={{ backgroundColor: "#f9f7f4", minHeight: "100dvh", padding: "24px 16px 32px", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 28px)", fontWeight: "700", color: "#7F5539", margin: 0, marginBottom: "8px" }}>
          Create New Franchise
        </h1>
        <p style={{ color: "#9C6644", margin: 0, fontSize: "14px" }}>
          Add a new franchise location with its details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          {/* Basic Information Card */}
          <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #E6CCB2", boxShadow: "0 4px 6px rgba(127, 85, 57, 0.08)", padding: "20px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <MapPin size={18} color="#7F5539" />
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0, color: "#7F5539" }}>Basic Information</h2>
            </div>

            {/* Code and Name */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                  Franchise Code <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  {...register("code")}
                  placeholder="FR_001"
                  style={errors.code ? inputErrorStyle : inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#B08968";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#DDB892";
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                  }}
                />
                {errors.code && <p style={errStyle}>{errors.code.message}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                  Franchise Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="Hanoi Franchise"
                  style={errors.name ? inputErrorStyle : inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#B08968";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                  onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DDB892";
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                  }}
                />
                {errors.name && <p style={errStyle}>{errors.name.message}</p>}
              </div>
            </div>

            {/* Hotline */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                Hotline <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                {...register("hotline")}
                placeholder="0123456789"
                maxLength={10}
                style={errors.hotline ? inputErrorStyle : inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#B08968";
                  e.currentTarget.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DDB892";
                  e.currentTarget.style.backgroundColor = "#faf8f6";
                }}
              />
              {errors.hotline && <p style={errStyle}>{errors.hotline.message}</p>}
            </div>

            {/* Logo URL */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                Logo URL
              </label>
              <input
                {...register("logo_url")}
                placeholder="https://example.com/logo.jpg"
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
            </div>

            {/* Address */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
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
                  onFocus={(e) => {
                    if (!errors.address) {
                      e.currentTarget.style.borderColor = "#B08968";
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.address) {
                      e.currentTarget.style.borderColor = "#DDB892";
                      e.currentTarget.style.backgroundColor = "#faf8f6";
                    }
                  }}
                />
                {errors.address && <p style={errStyle}>{errors.address.message}</p>}
              
            </div>

          {/* Operating Hours Card */}
          {/* <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #E6CCB2", boxShadow: "0 4px 6px rgba(127, 85, 57, 0.08)", padding: "32px", marginBottom: "24px" }}> */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Calendar size={18} color="#7F5539" />
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0, color: "#7F5539" }}>Operating Hours</h2>
            </div>

            {/* Opening Time */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                Opening Time <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="time"
                {...register("opened_at")}
                style={errors.opened_at ? inputErrorStyle : inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#B08968";
                  e.currentTarget.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DDB892";
                  e.currentTarget.style.backgroundColor = "#faf8f6";
                }}
              />
              {errors.opened_at && <p style={errStyle}>{errors.opened_at.message}</p>}
            </div>

            {/* Closing Time */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                Closing Time
              </label>
              <input
                type="time"
                {...register("closed_at")}
                style={errors.closed_at ? inputErrorStyle : inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#B08968";
                  e.currentTarget.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DDB892";
                  e.currentTarget.style.backgroundColor = "#faf8f6";
                }}
              />
              {errors.closed_at && <p style={errStyle}>{errors.closed_at.message}</p>}
            </div>

            {/* Google Map Script */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
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
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#B08968";
                  e.currentTarget.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DDB892";
                  e.currentTarget.style.backgroundColor = "#faf8f6";
                }}
              />
            </div>

            {/* Active Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#faf8f6", borderRadius: "8px", border: "1px solid #E6CCB2" }}>
              <input
                type="checkbox"
                id="is_active"
                {...register("is_active")}
                style={{ cursor: "pointer" }}
              />
              <label htmlFor="is_active" style={{ cursor: "pointer", fontSize: "14px", fontWeight: "600", margin: 0, color: "#374151" }}>
                Active Franchise
              </label>
            </div>
            
            {/* Action Buttons */}
          <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                gap: "12px",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid #E6CCB2",
              }}
            >
            <button
              type="button"
              onClick={() => navigate("/admin/franchises")}
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
                width: "100%",
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
                width: "100%",
                justifyContent: "center",
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
              {isCreating ? "Creating..." : "Create Franchise"}
            </button>
          </div>
          </div>
        </div>
      </form>
    </div>
  );
}
