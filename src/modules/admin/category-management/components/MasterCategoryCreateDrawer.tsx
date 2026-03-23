import { useState, useEffect } from "react";
import { X, FolderPlus, Settings, Save } from "lucide-react";
import { getCategorySelectItems } from "../api/category-franchise.api";
import { useCreateMasterCategory } from "./hooks/useCreateMasterCategory";
import type { CategorySelectItem } from "../api/category-franchise.types";

interface MasterCategoryCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MasterCategoryCreateDrawer({
  isOpen,
  onClose,
  onSuccess,
}: MasterCategoryCreateDrawerProps) {
  const { createCategory, isCreating } = useCreateMasterCategory();

  const [categories, setCategories] = useState<CategorySelectItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    parent_id: "",
  });

  const [errors, setErrors] = useState({
    code: "",
    name: "",
  });

  // Load parent categories
  useEffect(() => {
    if (!isOpen) return;

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await getCategorySelectItems();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {
      code: "",
      name: "",
    };

    if (!formData.code.trim()) {
      newErrors.code = "Category code is required";
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = "Code must be uppercase letters, numbers, and underscores only";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    setErrors(newErrors);
    return !newErrors.code && !newErrors.name;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        parent_id: formData.parent_id || "",
      };

      await createCategory(payload);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating master category:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      parent_id: "",
    });
    setErrors({
      code: "",
      name: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-[#8B5A2B]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5A2B]/10 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-[#8B5A2B]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Create Master Category
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Add a new category to the system
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Global Admin Function
                  </h3>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This creates a new master category in the system. Once created, 
                    franchise managers can add it to their franchise menus.
                  </p>
                </div>
              </div>
            </div>

            {/* Category Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <FolderPlus className="w-4 h-4 text-[#8B5A2B]" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Category Information
                </h3>
              </div>

              {/* Category Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. FNB_TOPPING"
                  className={`w-full h-11 px-4 rounded-lg border ${
                    errors.code
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                  } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-400`}
                />
                {errors.code && (
                  <p className="text-xs text-red-500 mt-1">{errors.code}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Use uppercase letters, numbers, and underscores (e.g. FNB_COFFEE, ICE_BLENDED)
                </p>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Topping"
                  className={`w-full h-11 px-4 rounded-lg border ${
                    errors.name
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]"
                  } bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-400`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Display name shown to customers and staff
                </p>
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Parent Category
                </label>
                <div className="relative">
                  <select
                    value={formData.parent_id}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_id: e.target.value })
                    }
                    disabled={isLoadingCategories}
                    className="w-full h-11 pl-4 pr-10 appearance-none rounded-lg border border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingCategories
                        ? "Loading categories..."
                        : "None (Top-level category)"}
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
                <p className="text-xs text-slate-500 mt-1">
                  Optional: Create a subcategory under an existing category
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description for internal use..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-colors resize-none placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Internal notes about this category (optional)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isCreating}
                className="px-6 py-2.5 rounded-lg bg-[#8B5A2B] text-white text-sm font-semibold hover:bg-[#724a23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
