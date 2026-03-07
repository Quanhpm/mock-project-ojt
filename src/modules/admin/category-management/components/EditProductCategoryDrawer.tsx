import { useState, useEffect } from "react";
import { X, Package, ListOrdered, CheckCircle2 } from "lucide-react";
import { reorderProductCategory, type ProductCategoryFranchise } from "../api/product-category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

interface EditProductCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productCategory: ProductCategoryFranchise | null;
}

export default function EditProductCategoryDrawer({
  isOpen,
  onClose,
  onSuccess,
  productCategory,
}: EditProductCategoryDrawerProps) {
  const { success, error: showError } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    display_order: 0,
  });

  const [errors, setErrors] = useState({
    display_order: "",
  });

  // Load initial data when drawer opens
  useEffect(() => {
    if (isOpen && productCategory) {
      setFormData({
        display_order: productCategory.display_order,
      });
      setErrors({ display_order: "" });
    }
  }, [isOpen, productCategory]);

  const validateForm = () => {
    const newErrors = {
      display_order: "",
    };

    if (formData.display_order < 0) {
      newErrors.display_order = "Display order must be 0 or greater";
    }

    setErrors(newErrors);
    return !newErrors.display_order;
  };

  const handleSave = async () => {
    if (!productCategory) {
      showError("No product selected");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsUpdating(true);
      console.log("Updating product category display order:", {
        id: productCategory.id,
        display_order: formData.display_order,
      });

      await reorderProductCategory(productCategory.id, {
        display_order: formData.display_order,
      });

      success("Display order updated successfully");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to update display order:", error);
      showError(error?.response?.data?.message || "Failed to update display order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setFormData({ display_order: 0 });
    setErrors({ display_order: "" });
    onClose();
  };

  if (!isOpen || !productCategory) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#8B5A2B]/10 bg-white">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[#8B5A2B]">
              Edit Product Display Order
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Change the display order for this product in category
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-[#8B5A2B] hover:bg-[#8B5A2B]/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Info (Read-only) */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8B5A2B]/10 flex items-center justify-center flex-shrink-0">
                <Package className="text-[#8B5A2B]" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{productCategory.product_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {productCategory.size && (
                    <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-slate-600 border border-slate-200">
                      Size: {productCategory.size}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    ₫{productCategory.price_base.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500">Category: <span className="font-medium text-slate-700">{productCategory.category_name}</span></p>
            </div>
          </div>

          {/* Display Order Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListOrdered className="text-[#8B5A2B]" size={20} />
              <label className="text-sm font-semibold text-slate-700">
                Display Order <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ display_order: Number(e.target.value) })
                }
                disabled={isUpdating}
                placeholder="Enter display order (0, 1, 2...)"
                min="0"
                className={`w-full h-12 px-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] outline-none text-slate-900 placeholder:text-slate-400 disabled:opacity-50 ${
                  errors.display_order ? "border-red-500" : "border-[#8B5A2B]/20"
                }`}
              />
            </div>
            {errors.display_order && (
              <p className="text-sm text-red-500">{errors.display_order}</p>
            )}
            <p className="text-xs text-slate-500">
              Lower numbers appear first. Use 0 for the first position.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">About Display Order</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Lower numbers = higher priority (shown first)</li>
              <li>• Same numbers = sorted by creation date</li>
              <li>• Negative numbers are allowed but not recommended</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold text-white bg-[#8B5A2B] hover:bg-[#7F5539] rounded-lg shadow-lg shadow-[#8B5A2B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
