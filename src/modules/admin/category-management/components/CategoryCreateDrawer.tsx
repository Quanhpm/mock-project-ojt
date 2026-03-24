import { useState, useEffect } from "react";
import { X, FolderPlus, Settings, Save, MapPin } from "lucide-react";
import { getCategorySelectItems } from "../api/category-franchise.api";
import { useCreateCategory } from "./hooks/useCreateCategory";
import { getFranchiseId, getRoleCode, useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useToast } from "@/hooks/use-toast.hook";
import { getFranchisesForSelect, type FranchiseSelectItem } from "@/apis/endpoints/user.api";
import type { CategorySelectItem } from "../api/category-franchise.types";

interface CategoryCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  franchiseId?: string | null;
}

export default function CategoryCreateDrawer({
  isOpen,
  onClose,
  onSuccess,
  franchiseId,
}: CategoryCreateDrawerProps) {
  const authFranchiseId = useAdminAuthStore((state) => getFranchiseId(state));
  const roleCode = useAdminAuthStore((state) => getRoleCode(state));
  const isGlobalRole = roleCode === "ADMIN" || roleCode === "MANAGER";

  const { createCategory, isCreating } = useCreateCategory();
  const { error: showError } = useToast();

  const [categories, setCategories] = useState<CategorySelectItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [loadCategoriesError, setLoadCategoriesError] = useState(false);

  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([]);
  const [isLoadingFranchises, setIsLoadingFranchises] = useState(false);
  const [loadFranchisesError, setLoadFranchisesError] = useState(false);

  const [formData, setFormData] = useState({
    franchise_id: "",
    category_id: "",
    display_order: 1,
  });

  const [errors, setErrors] = useState({
    franchise_id: "",
    category_id: "",
    display_order: "",
  });

  // Determine effective franchise ID
  const effectiveFranchiseId = isGlobalRole ? formData.franchise_id : authFranchiseId;

  // Load master categories
  useEffect(() => {
    if (!isOpen) return;

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setLoadCategoriesError(false);
        const data = await getCategorySelectItems();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setLoadCategoriesError(true);
        if (showError) {
          showError("Không thể tải danh sách danh mục");
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [isOpen]);

  // Load franchises for admin/manager
  useEffect(() => {
    if (!isOpen || !isGlobalRole) return;

    const loadFranchises = async () => {
      try {
        setIsLoadingFranchises(true);
        setLoadFranchisesError(false);
        const data = await getFranchisesForSelect();
        setFranchises(data ?? []);
      } catch (error) {
        console.error("Failed to load franchises:", error);
        setLoadFranchisesError(true);
        if (showError) {
          showError("Không thể tải danh sách franchise");
        }
      } finally {
        setIsLoadingFranchises(false);
      }
    };

    loadFranchises();
  }, [isOpen, isGlobalRole]);

  // Reset form when drawer opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        franchise_id: franchiseId || "",
        category_id: "",
        display_order: 1,
      });
    }
  }, [isOpen, franchiseId]);

  const validateForm = () => {
    const newErrors = {
      franchise_id: "",
      category_id: "",
      display_order: "",
    };

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
    return !newErrors.franchise_id && !newErrors.category_id && !newErrors.display_order;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!effectiveFranchiseId) {
      return;
    }

    try {
      await createCategory({
        franchise_id: effectiveFranchiseId,
        category_id: formData.category_id,
        display_order: formData.display_order,
      });

      setFormData({
        franchise_id: "",
        category_id: "",
        display_order: 1,
      });
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleClose = () => {
    setErrors({
      franchise_id: "",
      category_id: "",
      display_order: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  if (!isGlobalRole && !authFranchiseId) {
    return (
      <>
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleClose}
        />
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
          <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Assign Category</h2>
              <p className="text-sm text-slate-500 mt-1">
                Please select a franchise first
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </header>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-500 font-medium mb-4">
                No franchise selected
              </p>
              <p className="text-sm text-slate-600">
                Please select a franchise from the context menu to add categories.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-slate-200">
        {/* Drawer Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Assign Category</h2>
            <p className="text-sm text-slate-500 mt-1">
              Assign a category to your franchise menu.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {isLoadingCategories || isLoadingFranchises ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-600">Loading...</p>
            </div>
          ) : (
            <>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Franchise <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.franchise_id}
                        onChange={(e) =>
                          setFormData({ ...formData, franchise_id: e.target.value })
                        }
                        disabled={!!franchiseId || isLoadingFranchises || loadFranchisesError}
                        className={`w-full h-11 pl-4 pr-10 appearance-none rounded-lg border ${errors.franchise_id
                          ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                          } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
                      >
                        <option value="">
                          {isLoadingFranchises
                            ? "Loading franchises..."
                            : loadFranchisesError
                              ? "Failed to load franchises"
                              : "Select a franchise..."}
                        </option>
                        {franchises.map((franchise) => (
                          <option key={franchise.value} value={franchise.value}>
                            {franchise.name}
                          </option>
                        ))}
                      </select>
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
                      <p className="text-xs text-red-500 mt-1">{errors.franchise_id}</p>
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({ ...formData, category_id: e.target.value })
                        }
                        disabled={isLoadingCategories || loadCategoriesError}
                        className={`w-full h-11 pl-4 pr-10 appearance-none rounded-lg border ${errors.category_id
                          ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                          } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
                      >
                        <option value="">
                          {isLoadingCategories
                            ? "Loading categories..."
                            : loadCategoriesError
                              ? "Failed to load categories"
                              : "Select a category..."}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.name} ({cat.code})
                          </option>
                        ))}
                      </select>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Display Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: Number(e.target.value),
                      })
                    }
                    min="1"
                    className={`w-full h-11 px-4 rounded-lg border ${errors.display_order
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                      } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors`}
                  />
                  {errors.display_order && (
                    <p className="text-xs text-red-500 mt-1">{errors.display_order}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Lower numbers appear first in the menu. Categories are sorted by this value.
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
                      This will add an existing category to the menu of your current franchise context.
                      You can add products to this category after creation.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex items-center justify-end gap-3 mt-auto">
          <button
            onClick={handleClose}
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
            {isCreating ? "Creating..." : "Assign Category"}
          </button>
        </div>
      </div>
    </>
  );
}
