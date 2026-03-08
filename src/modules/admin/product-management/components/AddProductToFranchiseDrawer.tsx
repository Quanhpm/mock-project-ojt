import { useState, useEffect } from "react";
import { X, Package, Store, Maximize2, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { useProductFranchiseActions } from "../hooks/useProductFranchiseActions.hook";
import { getProductSelectItems } from "./product.api";
import type { ProductSelectItem } from "./product.types";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useToast } from "@/hooks/use-toast.hook";
import { addProductToCategoryFranchise } from "@/modules/admin/category-management/api/product-category-franchise.api";
import { searchProductFranchises } from "../api/product-franchise.api";
import { SIZE_OPTIONS, type SizeCode } from "@/types/product-option.type";

interface AddProductToFranchiseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categoryFranchiseId?: string; // Optional: if provided, will auto-assign to category after activation
}

export default function AddProductToFranchiseDrawer({
  isOpen,
  onClose,
  onSuccess,
  categoryFranchiseId,
}: AddProductToFranchiseDrawerProps) {
  const { activeContext, roles } = useAdminAuthStore();
  const franchiseId = activeContext?.franchise_id || (roles.length > 0 ? roles[0].franchise_id : null);
  const franchiseName = roles.length > 0 ? roles[0].franchise_name : "";

  const { create, isCreating } = useProductFranchiseActions();
  const { error: showError } = useToast();

  const [products, setProducts] = useState<ProductSelectItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Track existing product+size combinations in the FRANCHISE (not just category)
  const [existingProductSizes, setExistingProductSizes] = useState<Set<string>>(new Set());
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const [formData, setFormData] = useState<{
    product_id: string;
    size: SizeCode | "";
    price_base: number;
  }>({
    product_id: "",
    size: "",
    price_base: 0,
  });

  const [errors, setErrors] = useState({
    product_id: "",
    size: "",
    price_base: "",
  });

  // Load master products
  useEffect(() => {
    if (!isOpen) return;

    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        
        // Validate franchiseId exists
        if (!franchiseId) {
          showError("Please select a franchise first");
          console.error("No franchise_id available");
          return;
        }
        
        console.log("Loading active master products via search API");
        // Using search API as workaround since /products/select has backend issues
        const data = await getProductSelectItems();
        setProducts(data);
        console.log(`Loaded ${data.length} products successfully`);
      } catch (error) {
        console.error("Failed to load products:", error);
        showError("Failed to load products");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [isOpen]);

  // Load existing products in the franchise
  useEffect(() => {
    if (!isOpen || !franchiseId) return;

    const loadExistingProducts = async () => {
      try {
        setIsLoadingExisting(true);
        console.log("Loading existing product franchises for franchise:", franchiseId);
        
        // Only send required fields and fields we want to filter
        // According to API doc: all searchCondition fields are optional
        const response = await searchProductFranchises({
          searchCondition: {
            franchise_id: franchiseId,
            // Don't send empty strings - omit fields we don't need to filter
            // is_deleted default is FALSE in backend
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 1000,
          },
        });

        console.log("API Response:", response);
        console.log("Total products in franchise:", response.data.length);

        // Build Set of "productId|size" (including all non-deleted products)
        const existingSet = new Set<string>();
        response.data.forEach((item) => {
          const key = `${item.product_id}|${item.size}`;
          existingSet.add(key);
          console.log(`Existing: Product ${item.product_name || item.product_id} - Size ${item.size} - Deleted: ${item.is_deleted}`);
        });

        setExistingProductSizes(existingSet);
        console.log(`Found ${existingSet.size} existing product-size combinations in franchise`);
      } catch (error) {
        console.error("Failed to load existing product franchises:", error);
        console.warn("Will rely on backend validation instead");
      } finally {
        setIsLoadingExisting(false);
      }
    };

    loadExistingProducts();
  }, [isOpen, franchiseId]);

  const validateForm = () => {
    const newErrors = {
      product_id: "",
      size: "",
      price_base: "",
    };

    if (!formData.product_id) {
      newErrors.product_id = "Please select a product";
    }

    if (!formData.size || !formData.size.trim()) {
      newErrors.size = "Size is required";
    }

    if (formData.price_base <= 0) {
      newErrors.price_base = "Price must be greater than 0";
    }

    // Validate price range
    if (formData.product_id) {
      const selectedProduct = products.find((p) => p.value === formData.product_id);
      if (selectedProduct) {
        if (
          formData.price_base < selectedProduct.min_price ||
          formData.price_base > selectedProduct.max_price
        ) {
          newErrors.price_base = `Price must be between ₫${selectedProduct.min_price.toLocaleString()} and ₫${selectedProduct.max_price.toLocaleString()}`;
        }
      }
    }

    // Check if product+size already exists in franchise
    if (formData.product_id && formData.size) {
      const key = `${formData.product_id}|${formData.size}`;
      if (existingProductSizes.has(key)) {
        newErrors.size = "This product with this size already exists in the franchise";
      }
    }

    setErrors(newErrors);
    return !newErrors.product_id && !newErrors.size && !newErrors.price_base;
  };

  const handleSave = async () => {
    if (!franchiseId) {
      showError("No franchise selected");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Validate ObjectId format (24 hex characters)
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    if (!isValidObjectId(franchiseId)) {
      showError(`Invalid franchise ID format: ${franchiseId}`);
      console.error("Invalid franchise_id:", franchiseId);
      return;
    }

    if (!isValidObjectId(formData.product_id)) {
      showError(`Invalid product ID format: ${formData.product_id}`);
      console.error("Invalid product_id:", formData.product_id);
      return;
    }

    try {
      console.log("Submitting product franchise:", {
        franchise_id: franchiseId,
        product_id: formData.product_id,
        size: formData.size,
        price_base: formData.price_base,
      });

      // Step 1: Activate product for franchise
      const productFranchise = await create({
        franchise_id: franchiseId,
        product_id: formData.product_id,
        size: formData.size, // Already uppercase from SIZE_OPTIONS
        price_base: formData.price_base,
      });

      // Step 2: If categoryFranchiseId provided, auto-assign to category
      if (categoryFranchiseId && productFranchise) {
        console.log("Auto-assigning product to category:", {
          category_franchise_id: categoryFranchiseId,
          product_franchise_id: productFranchise.id,
        });
        
        await addProductToCategoryFranchise({
          category_franchise_id: categoryFranchiseId,
          product_franchise_id: productFranchise.id,
          display_order: 0, // Default display order
        });
        
        console.log("Product assigned to category successfully");
      }

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      // If error is "already exists", cache it for next time
      const errorMessage = error?.response?.data?.message || "";
      console.error("Failed to create product franchise:", errorMessage);
      
      if (errorMessage.includes("already exists")) {
        // Extract and cache this combination
        const key = `${formData.product_id}|${formData.size}`;
        setExistingProductSizes(prev => {
          const newSet = new Set(prev);
          newSet.add(key);
          console.log(`Cached duplicate: ${key}`);
          return newSet;
        });
        
        // Re-validate to show error immediately
        setErrors(prev => ({
          ...prev,
          size: "This product with this size already exists in the franchise"
        }));
      }
      // Error toast already handled by hook
    }
  };

  const handleClose = () => {
    setFormData({
      product_id: "",
      size: "",
      price_base: 0,
    });
    setErrors({
      product_id: "",
      size: "",
      price_base: "",
    });
    onClose();
  };

  const handleProductChange = (productId: string) => {
    // Auto-fill price with min_price of selected product
    const selectedProduct = products.find((p) => p.value === productId);
    if (selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        product_id: productId,
        size: "", // Reset size when product changes
        price_base: selectedProduct.min_price,
      }));
    }
  };

  // Get available sizes for the selected product (excluding already existing sizes)
  const getAvailableSizes = () => {
    if (!formData.product_id) return SIZE_OPTIONS;
    
    return SIZE_OPTIONS.filter((sizeOption) => {
      const key = `${formData.product_id}|${sizeOption.code}`;
      return !existingProductSizes.has(key);
    });
  };

  // Count how many sizes exist for a product
  const getExistingSizeCount = (productId: string) => {
    let count = 0;
    SIZE_OPTIONS.forEach((sizeOption) => {
      const key = `${productId}|${sizeOption.code}`;
      if (existingProductSizes.has(key)) {
        count++;
      }
    });
    return count;
  };

  const availableSizes = getAvailableSizes();

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
              <h2 className="text-xl font-semibold text-[#8B5A2B]">
                Add Product to Franchise
              </h2>
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
              <p className="text-red-500 font-medium mb-4">No franchise selected</p>
              <p className="text-sm text-slate-600">
                Please select a franchise from the context menu.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const selectedProduct = products.find((p) => p.value === formData.product_id);

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
              Add Product to Franchise
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure new product listing for your branch
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
          {/* Product Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="text-[#8B5A2B]" size={20} />
              <label className="text-sm font-semibold text-slate-700">
                Product <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <select
                value={formData.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                disabled={isLoadingProducts || isCreating || isLoadingExisting}
                className={`w-full h-12 pl-4 pr-10 appearance-none bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] outline-none text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.product_id ? "border-red-500" : "border-[#8B5A2B]/20"
                }`}
              >
                <option value="" disabled>
                  {isLoadingProducts || isLoadingExisting ? "Loading products..." : "Select product"}
                </option>
                {products.map((product) => {
                  const existingCount = getExistingSizeCount(product.value);
                  const label = existingCount > 0 
                    ? `${product.label} (${product.SKU}) - ₫${product.min_price.toLocaleString()} - ₫${product.max_price.toLocaleString()} [${existingCount}/${SIZE_OPTIONS.length} sizes activated]`
                    : `${product.label} (${product.SKU}) - ₫${product.min_price.toLocaleString()} - ₫${product.max_price.toLocaleString()}`;
                  
                  return (
                    <option key={product.value} value={product.value}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg
                  className="w-5 h-5"
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
            {errors.product_id && (
              <p className="text-sm text-red-500">{errors.product_id}</p>
            )}
            {selectedProduct && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Price Range:</strong> ₫{selectedProduct.min_price.toLocaleString()} - ₫
                  {selectedProduct.max_price.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Franchise (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Store className="text-[#8B5A2B]" size={20} />
              <label className="text-sm font-semibold text-slate-700">Franchise</label>
            </div>
            <input
              type="text"
              value={franchiseName || `Franchise ${franchiseId}`}
              readOnly
              className="w-full h-12 px-4 bg-slate-100 border border-[#8B5A2B]/10 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Size and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Size Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Maximize2 className="text-[#8B5A2B]" size={20} />
                <label className="text-sm font-semibold text-slate-700">
                  Size <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <select
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value as SizeCode | "" })
                  }
                  disabled={isCreating || !formData.product_id}
                  className={`w-full h-12 pl-4 pr-10 appearance-none bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] outline-none text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.size ? "border-red-500" : "border-[#8B5A2B]/20"
                  }`}
                >
                  <option value="" disabled>
                    {!formData.product_id ? "Select product first" : "Select size"}
                  </option>
                  {availableSizes.map((sizeOption) => (
                    <option key={sizeOption.code} value={sizeOption.code}>
                      {sizeOption.label} (+₫{sizeOption.bonusPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg
                    className="w-5 h-5"
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
              {errors.size && <p className="text-sm text-red-500">{errors.size}</p>}
              {availableSizes.length === 0 && formData.product_id && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="text-amber-600" size={16} />
                  <p className="text-xs text-amber-700">All sizes already activated for this product in franchise</p>
                </div>
              )}
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="text-[#8B5A2B]" size={20} />
                <label className="text-sm font-semibold text-slate-700">
                  Base Price (₫) <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price_base || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price_base: Number(e.target.value) })
                  }
                  disabled={isCreating}
                  placeholder="Enter base price"
                  className={`w-full h-12 pl-4 pr-10 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] outline-none text-slate-900 placeholder:text-slate-400 disabled:opacity-50 ${
                    errors.price_base ? "border-red-500" : "border-[#8B5A2B]/20"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5A2B] font-bold">
                  ₫
                </div>
              </div>
              {errors.price_base && (
                <p className="text-sm text-red-500">{errors.price_base}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isCreating || isLoadingProducts}
            className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold text-white bg-[#8B5A2B] hover:bg-[#7F5539] rounded-lg shadow-lg shadow-[#8B5A2B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Add to Franchise
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
