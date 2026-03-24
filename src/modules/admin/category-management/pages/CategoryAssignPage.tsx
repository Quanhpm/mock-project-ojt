import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Save, Loader2 } from "lucide-react";
import { getCategorySelectItems } from "../api/category-franchise.api";
import { useCreateCategory } from "../components/hooks/useCreateCategory";
import {
  getFranchiseId,
  getRoleCode,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useToast } from "@/hooks/use-toast.hook";
import {
  getFranchisesForSelect,
  type FranchiseSelectItem,
} from "@/apis/endpoints/user.api";
import type { CategorySelectItem } from "../api/category-franchise.types";
import { ROUTER_URL } from "@/routes/router.const";

export default function CategoryAssignPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFranchiseId = searchParams.get("franchise_id");

  const authFranchiseId = useAdminAuthStore((state) => getFranchiseId(state));
  const roleCode = useAdminAuthStore((state) => getRoleCode(state));
  const isGlobalRole = roleCode === "ADMIN" || roleCode === "MANAGER";

  const { createCategory, isCreating } = useCreateCategory();
  const { error: showError, success: showSuccess } = useToast();

  const [categories, setCategories] = useState<CategorySelectItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [loadCategoriesError, setLoadCategoriesError] = useState(false);

  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([]);
  const [isLoadingFranchises, setIsLoadingFranchises] = useState(false);
  const [loadFranchisesError, setLoadFranchisesError] = useState(false);

  const [formData, setFormData] = useState<{
    franchise_id: string;
    category_id: string;
    display_order: number | "";
  }>({
    franchise_id: urlFranchiseId || "",
    category_id: "",
    display_order: "",
  });

  const [errors, setErrors] = useState({
    franchise_id: "",
    category_id: "",
    display_order: "",
  });

  const effectiveFranchiseId = isGlobalRole
    ? formData.franchise_id
    : authFranchiseId;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setLoadCategoriesError(false);
        const data = await getCategorySelectItems();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setLoadCategoriesError(true);
        if (showError) showError("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isGlobalRole) return;
    const loadFranchises = async () => {
      try {
        setIsLoadingFranchises(true);
        setLoadFranchisesError(false);
        const data = await getFranchisesForSelect();
        setFranchises(data ?? []);
      } catch (error) {
        console.error("Failed to load franchises:", error);
        setLoadFranchisesError(true);
        if (showError) showError("Failed to load franchises");
      } finally {
        setIsLoadingFranchises(false);
      }
    };
    loadFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGlobalRole]);

  const handleBack = () => {
    navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.CATEGORY}`);
  };

  const validateForm = () => {
    const newErrors = { franchise_id: "", category_id: "", display_order: "" };
    if (isGlobalRole && !formData.franchise_id) {
      newErrors.franchise_id = "Please select a franchise";
    }
    if (!formData.category_id) {
      newErrors.category_id = "Please select a category";
    }
    if (formData.display_order === "" || formData.display_order < 1) {
      newErrors.display_order = "Display order must be at least 1";
    }
    setErrors(newErrors);
    return (
      !newErrors.franchise_id &&
      !newErrors.category_id &&
      !newErrors.display_order
    );
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!effectiveFranchiseId) return;
    try {
      await createCategory({
        franchise_id: effectiveFranchiseId,
        category_id: formData.category_id,
        display_order: formData.display_order as number,
      });
      if (showSuccess) showSuccess("Category assigned successfully");
      navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.CATEGORY}`);
    } catch (error) {
      console.error("Failed to assign category:", error);
    }
  };

  if (!isGlobalRole && !authFranchiseId) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9f7f4", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#ef4444", fontWeight: "600", fontSize: "18px", margin: 0 }}>No franchise selected</p>
        <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
          Please select a franchise from the context menu to assign categories.
        </p>
        <button
          onClick={handleBack}
          style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: "#8B5A2B", color: "white", borderRadius: "8px", border: "none", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
        >
          Back to Categories
        </button>
      </div>
    );
  }

  let franchisePlaceholder = "Select a franchise...";
  if (isLoadingFranchises) franchisePlaceholder = "Loading franchises...";
  else if (loadFranchisesError) franchisePlaceholder = "Failed to load franchises";

  let categoryPlaceholder = "Select a category...";
  if (isLoadingCategories) categoryPlaceholder = "Loading categories...";
  else if (loadCategoriesError) categoryPlaceholder = "Failed to load categories";

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
    transition: "border-color 0.2s, background-color 0.2s",
  };

  const errorStyle: React.CSSProperties = {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#ef4444",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f7f4", padding: "48px 20px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#7F5539", margin: 0 }}>
            Assign Category
          </h1>
          <p style={{ fontSize: "14px", color: "#9C6644", marginTop: "8px", margin: "8px 0 0" }}>
            Assign a master category to a franchise menu
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #E6CCB2",
            boxShadow: "0 4px 6px rgba(127, 85, 57, 0.08)",
            padding: "32px",
          }}
        >
          {isLoadingCategories || isLoadingFranchises ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
              <p style={{ color: "#6b7280" }}>Loading...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Franchise Selection */}
              {isGlobalRole && (
                <div>
                  <label htmlFor="franchise-select" style={labelStyle}>
                    Franchise <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    id="franchise-select"
                    value={formData.franchise_id}
                    onChange={(e) => setFormData({ ...formData, franchise_id: e.target.value })}
                    disabled={!!urlFranchiseId || isLoadingFranchises || loadFranchisesError}
                    style={{ ...inputStyle, cursor: isLoadingFranchises ? "wait" : "pointer" }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#B08968";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#DDB892";
                      e.currentTarget.style.backgroundColor = "#faf8f6";
                    }}
                  >
                    <option value="">{franchisePlaceholder}</option>
                    {franchises.map((franchise) => (
                      <option key={franchise.value} value={franchise.value}>
                        {franchise.name}
                      </option>
                    ))}
                  </select>
                  {errors.franchise_id && <p style={errorStyle}>{errors.franchise_id}</p>}
                </div>
              )}

              {/* Category Selection */}
              <div>
                <label htmlFor="category-select" style={labelStyle}>
                  Category <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  id="category-select"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  disabled={isLoadingCategories || loadCategoriesError}
                  style={{ ...inputStyle, cursor: isLoadingCategories ? "wait" : "pointer" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#B08968";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#DDB892";
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                  }}
                >
                  <option value="">{categoryPlaceholder}</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
                {errors.category_id && <p style={errorStyle}>{errors.category_id}</p>}
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                  Choose from master categories to add to this franchise.
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label htmlFor="display-order" style={labelStyle}>
                  Display Order <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  id="display-order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setFormData({ ...formData, display_order: "" });
                      setErrors((prev) => ({ ...prev, display_order: "Display order is required" }));
                      return;
                    }
                    const val = Math.max(1, Math.floor(Number(raw)));
                    setFormData({ ...formData, display_order: val });
                    setErrors((prev) => ({ ...prev, display_order: val < 1 ? "Display order must be at least 1" : "" }));
                  }}
                  onKeyDown={(e) => {
                    if (["-", "+", ".", "e", "E"].includes(e.key)) e.preventDefault();
                  }}
                  min="1"
                  step="1"
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
                {errors.display_order && <p style={errorStyle}>{errors.display_order}</p>}
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                  Lower numbers appear first in the menu.
                </p>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "8px",
                  paddingTop: "24px",
                  borderTop: "1px solid #E6CCB2",
                }}
              >
                <button
                  type="button"
                  onClick={handleBack}
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
                  type="button"
                  onClick={handleSave}
                  disabled={isCreating || isLoadingCategories}
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
                    cursor: isCreating || isLoadingCategories ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCreating && !isLoadingCategories) {
                      e.currentTarget.style.backgroundColor = "#9C6644";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isCreating ? "#B08968" : "#7F5539";
                  }}
                >
                  {isCreating ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isCreating ? "Assigning..." : "Assign Category"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
