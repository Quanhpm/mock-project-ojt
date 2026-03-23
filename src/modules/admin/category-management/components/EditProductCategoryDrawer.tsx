import { useState, useEffect } from "react";
import { X, Package, ListOrdered, CheckCircle2 } from "lucide-react";
import { reorderProductCategoryFranchises } from "@/apis/endpoints/product-category-franchise.api";
import type { ProductCategoryFranchise } from "../api/product-category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

interface EditProductCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (itemId: string, newDisplayOrder: number) => void;
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

      await reorderProductCategoryFranchises({
        category_franchise_id: productCategory.category_franchise_id,
        item_id: productCategory.id,
        new_position: formData.display_order,
      });

      success("Display order updated successfully");
      const savedId = productCategory.id;
      const savedOrder = formData.display_order;
      handleClose();
      onSuccess?.(savedId, savedOrder);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      {/* Modal */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5A2B]/10 flex items-center justify-center flex-shrink-0">
              <Package className="text-[#8B5A2B]" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Edit Product Display Order
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Change the display order for this product in category
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-[#8B5A2B] hover:bg-[#8B5A2B]/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Product Info (Read-only) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-start gap-3">
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
            <p className="text-xs text-slate-500 border-t border-slate-200 pt-2">
              Category: <span className="font-medium text-slate-700">{productCategory.category_name}</span>
            </p>
          </div>

          {/* Display Order Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListOrdered className="text-[#8B5A2B]" size={18} />
              <label className="text-sm font-semibold text-slate-700">
                Display Order <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({ display_order: Number(e.target.value) })
              }
              disabled={isUpdating}
              placeholder="Enter display order (0, 1, 2...)"
              min="0"
              className={`w-full h-11 px-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] outline-none text-slate-900 placeholder:text-slate-400 disabled:opacity-50 ${
                errors.display_order ? "border-red-500" : "border-[#8B5A2B]/20"
              }`}
            />
            {errors.display_order && (
              <p className="text-sm text-red-500">{errors.display_order}</p>
            )}
            <p className="text-xs text-slate-500">
              Lower numbers appear first. Use 0 for the first position.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#8B5A2B] hover:bg-[#7F5539] rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
