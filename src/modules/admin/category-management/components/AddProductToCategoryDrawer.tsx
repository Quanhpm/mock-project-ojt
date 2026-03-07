import { useEffect, useMemo, useRef, useState } from "react";
import { X, Package, Store, ListOrdered, CheckCircle2, AlertCircle } from "lucide-react";
import { addProductToCategoryFranchise, searchProductCategoryFranchises } from "../api/product-category-franchise.api";
import { searchProductFranchises, type ProductFranchise } from "@/modules/admin/product-management/api/product-franchise.api";
import { getFranchiseId, useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useToast } from "@/hooks/use-toast.hook";

interface AddProductToCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categoryFranchiseId: string;
  categoryId: string;
  categoryName?: string;
}

export default function AddProductToCategoryDrawer({
  isOpen,
  onClose,
  onSuccess,
  categoryFranchiseId,
  categoryId,
  categoryName,
}: AddProductToCategoryDrawerProps) {
  const franchiseId = useAdminAuthStore((state) => getFranchiseId(state));
  const { roles } = useAdminAuthStore();
  const franchiseName = roles[0]?.franchise_name || "";
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productFranchises, setProductFranchises] = useState<ProductFranchise[]>([]);
  const [linkedProductFranchiseIds, setLinkedProductFranchiseIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    product_franchise_id: "",
    display_order: 0,
  });
  const [errors, setErrors] = useState({
    product_franchise_id: "",
    display_order: "",
  });
  const lastLoadedContextRef = useRef<string>("");

  useEffect(() => {
    if (!isOpen || !franchiseId || !categoryFranchiseId || !categoryId) {
      lastLoadedContextRef.current = "";
      return;
    }

    const contextKey = `${franchiseId}|${categoryFranchiseId}|${categoryId}`;
    if (lastLoadedContextRef.current === contextKey) {
      return;
    }
    lastLoadedContextRef.current = contextKey;

    const loadDrawerData = async () => {
      try {
        setIsLoading(true);

        const [franchiseProductsResponse, categoryProductsResponse] = await Promise.all([
          searchProductFranchises({
            searchCondition: {
              franchise_id: franchiseId,
            },
            pageInfo: {
              pageNum: 1,
              pageSize: 1000,
            },
          }),
          searchProductCategoryFranchises({
            searchCondition: {
              franchise_id: franchiseId,
              category_id: categoryId,
              is_deleted: false,
            },
            pageInfo: {
              pageNum: 1,
              pageSize: 1000,
            },
          }),
        ]);

        setProductFranchises(franchiseProductsResponse.data);
        setLinkedProductFranchiseIds(
          categoryProductsResponse.data.map((item) => item.product_franchise_id)
        );
        setFormData((prev) => ({
          ...prev,
          display_order: categoryProductsResponse.data.length,
        }));
      } catch (error) {
        console.error("Failed to load add-product drawer data:", error);
        showError("Failed to load franchise products");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDrawerData();
  }, [isOpen, franchiseId, categoryFranchiseId, categoryId]);

  const availableProducts = useMemo(
    () =>
      productFranchises.filter(
        (item) => !linkedProductFranchiseIds.includes(item.id) && !item.is_deleted && item.is_active
      ),
    [linkedProductFranchiseIds, productFranchises]
  );

  const selectedProduct = availableProducts.find(
    (item) => item.id === formData.product_franchise_id
  );

  const validateForm = () => {
    const nextErrors = {
      product_franchise_id: "",
      display_order: "",
    };

    if (!formData.product_franchise_id) {
      nextErrors.product_franchise_id = "Please select a franchise product";
    }

    if (formData.display_order < 0) {
      nextErrors.display_order = "Display order must be 0 or greater";
    }

    setErrors(nextErrors);
    return !nextErrors.product_franchise_id && !nextErrors.display_order;
  };

  const handleClose = () => {
    lastLoadedContextRef.current = "";
    setFormData({
      product_franchise_id: "",
      display_order: 0,
    });
    setErrors({
      product_franchise_id: "",
      display_order: "",
    });
    onClose();
  };

  const handleSave = async () => {
    if (!categoryFranchiseId) {
      showError("Missing category franchise context");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      await addProductToCategoryFranchise({
        category_franchise_id: categoryFranchiseId,
        product_franchise_id: formData.product_franchise_id,
        display_order: formData.display_order,
      });

      success("Product added to category successfully");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to add product to category:", error);
      showError(error?.response?.data?.message || "Failed to add product to category");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (!franchiseId) {
    return (
      <>
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleClose}
        />
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          <header className="flex items-center justify-between px-6 py-5 border-b border-[#8B5A2B]/10">
            <div>
              <h2 className="text-xl font-semibold text-[#8B5A2B]">Add Product to Category</h2>
              <p className="text-sm text-slate-500 mt-1">Please select a franchise context first</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </header>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#8B5A2B]/10 bg-white">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[#8B5A2B]">Add Product to Category</h2>
            <p className="text-sm text-slate-500 mt-1">Select an existing franchise product and link it to this category</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-[#8B5A2B] hover:bg-[#8B5A2B]/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Franchise</p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Store size={16} className="text-[#8B5A2B]" />
                  <span>{franchiseName || franchiseId}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Category</p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Package size={16} className="text-[#8B5A2B]" />
                  <span>{categoryName || categoryId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="text-[#8B5A2B]" size={20} />
              <label className="text-sm font-semibold text-slate-700">
                Franchise Product <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <select
                value={formData.product_franchise_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    product_franchise_id: e.target.value,
                  }))
                }
                disabled={isLoading || isSaving || availableProducts.length === 0}
                className={`w-full h-12 pl-4 pr-10 appearance-none bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] outline-none text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.product_franchise_id ? "border-red-500" : "border-[#8B5A2B]/20"
                }`}
              >
                <option value="" disabled>
                  {isLoading ? "Loading franchise products..." : "Select franchise product"}
                </option>
                {availableProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product_name || item.product_id} {item.product_sku ? `(${item.product_sku})` : ""} - Size {item.size} - ₫{item.price_base.toLocaleString("vi-VN")}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.product_franchise_id && (
              <p className="text-sm text-red-500">{errors.product_franchise_id}</p>
            )}
            {!isLoading && availableProducts.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="text-amber-600" size={16} />
                <p className="text-xs text-amber-700">
                  No available franchise products to add. Either this franchise has no activated products yet or all products are already linked to this category.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListOrdered className="text-[#8B5A2B]" size={20} />
              <label className="text-sm font-semibold text-slate-700">
                Display Order <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  display_order: Number(e.target.value),
                }))
              }
              disabled={isSaving}
              min="0"
              className={`w-full h-12 px-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] outline-none text-slate-900 placeholder:text-slate-400 disabled:opacity-50 ${
                errors.display_order ? "border-red-500" : "border-[#8B5A2B]/20"
              }`}
            />
            {errors.display_order && <p className="text-sm text-red-500">{errors.display_order}</p>}
          </div>

          {selectedProduct && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Selected Product</h4>
              <p className="text-sm text-blue-700">{selectedProduct.product_name || selectedProduct.product_id}</p>
              <p className="text-xs text-blue-700 mt-1">Size {selectedProduct.size} • ₫{selectedProduct.price_base.toLocaleString("vi-VN")}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || availableProducts.length === 0}
            className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold text-white bg-[#8B5A2B] hover:bg-[#7F5539] rounded-lg shadow-lg shadow-[#8B5A2B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Add to Category
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}