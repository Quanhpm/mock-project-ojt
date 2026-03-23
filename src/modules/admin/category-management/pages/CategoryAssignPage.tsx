import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FolderPlus, Settings, Save, MapPin } from "lucide-react";
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

  const [formData, setFormData] = useState({
    franchise_id: urlFranchiseId || "",
    category_id: "",
    display_order: 1,
  });

  const [errors, setErrors] = useState({
    franchise_id: "",
    category_id: "",
    display_order: "",
  });

  const effectiveFranchiseId = isGlobalRole
    ? formData.franchise_id
    : authFranchiseId;

  // Load master categories
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

  // Load franchises for admin/manager
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
    if (formData.display_order < 1) {
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
    if (!effectiveFranchiseId) return;
    if (!validateForm()) return;

    try {
      await createCategory({
        franchise_id: effectiveFranchiseId,
        category_id: formData.category_id,
        display_order: formData.display_order,
      });
      if (showSuccess) showSuccess("Category assigned successfully");
      navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.CATEGORY}`);
    } catch (error) {
      console.error("Failed to assign category:", error);
    }
  };

  if (!isGlobalRole && !authFranchiseId) {
    return (
      <div className="min-h-screen bg-gray-50 p-10 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-semibold text-lg">No franchise selected</p>
        <p className="text-slate-600 text-sm">
          Please select a franchise from the context menu to assign categories.
        </p>
        <button
          onClick={handleBack}
          className="mt-4 px-5 py-2.5 bg-[#8B5A2B] text-white rounded-lg text-sm font-medium hover:bg-[#6d4423] transition-colors"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Categories
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8B5A2B]/10 flex items-center justify-center">
            <FolderPlus className="w-5 h-5 text-[#8B5A2B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assign Category</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Assign a category to a franchise menu
            </p>
          </div>
        </div>
      </div>

      {/* Page Body */}
      <div className="max-w-2xl mx-auto px-8 py-8">
        {isLoadingCategories || isLoadingFranchises ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-600">Loading...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
            {/* Franchise Selection (Admin/Manager only) */}
            {isGlobalRole && (
              <section className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin className="text-[#8B5A2B]" size={20} />
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Franchise Selection
                  </h3>
                </div>
                <div>
                  <label
                    htmlFor="franchise-select"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Franchise <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {(() => {
                      let franchisePlaceholder = "Select a franchise...";
                      if (isLoadingFranchises) {
                        franchisePlaceholder = "Loading franchises...";
                      } else if (loadFranchisesError) {
                        franchisePlaceholder = "Failed to load franchises";
                      }
                      return (
                    <select
                      id="franchise-select"
                      value={formData.franchise_id}
                      onChange={(e) =>
                        setFormData({ ...formData, franchise_id: e.target.value })
                      }
                      disabled={
                        !!urlFranchiseId ||
                        isLoadingFranchises ||
                        loadFranchisesError
                      }
                      className={`w-full h-11 pl-4 pr-10 appearance-none rounded-lg border ${
                        errors.franchise_id
                          ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                      } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
                    >
                      <option value="">{franchisePlaceholder}</option>
                      {franchises.map((franchise) => (
                        <option key={franchise.value} value={franchise.value}>
                          {franchise.name}
                        </option>
                      ))}
                    </select>
                      );
                    })()}
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.franchise_id && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.franchise_id}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Category Selection */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FolderPlus className="text-[#8B5A2B]" size={20} />
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                  Category Information
                </h3>
              </div>
              <div>
                <label
                  htmlFor="category-select"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {(() => {
                    let categoryPlaceholder = "Select a category...";
                    if (isLoadingCategories) {
                      categoryPlaceholder = "Loading categories...";
                    } else if (loadCategoriesError) {
                      categoryPlaceholder = "Failed to load categories";
                    }
                    return (
                  <select
                    id="category-select"
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    disabled={isLoadingCategories || loadCategoriesError}
                    className={`w-full h-11 pl-4 pr-10 appearance-none rounded-lg border ${
                      errors.category_id
                        ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                        : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                    } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
                  >
                    <option value="">{categoryPlaceholder}</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                    );
                  })()}
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.category_id && (
                  <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Choose from master categories to add to this franchise.
                </p>
              </div>
            </section>

            {/* Display Settings */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Settings className="text-[#8B5A2B]" size={20} />
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                  Display Settings
                </h3>
              </div>
              <div>
                <label
                  htmlFor="display-order"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Display Order <span className="text-red-500">*</span>
                </label>
                <input
                  id="display-order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: Number(e.target.value),
                    })
                  }
                  min="1"
                  className={`w-full h-11 px-4 rounded-lg border ${
                    errors.display_order
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                  } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors`}
                />
                {errors.display_order && (
                  <p className="text-xs text-red-500 mt-1">{errors.display_order}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Lower numbers appear first in the menu.
                </p>
              </div>
            </section>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">About Category Assignment</p>
                  <p className="text-blue-700">
                    This will add an existing master category to the menu of the
                    selected franchise. You can add products to this category after
                    creation.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={handleBack}
                disabled={isCreating}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isCreating || isLoadingCategories}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#8B5A2B] border border-transparent rounded-lg hover:bg-[#8B5A2B]/90 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isCreating ? "Assigning..." : "Assign Category"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
