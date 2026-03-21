import React, { useState } from "react";
import { useCreateProduct } from "./hooks/useCreateProduct";
import { useAssignProductFranchise } from "../hooks/useAssignProductFranchise.hook";
import { SIZE_OPTIONS } from "@/types/product-option.type";
import type { ProductCreatePayload } from "./product.types";
import { CKEditorField } from "@/components/ui";

// ======================== Props ========================

interface CreateProductWithFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ======================== Component ========================

export default function CreateProductWithFranchiseModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductWithFranchiseModalProps) {
  const {
    createProduct,
    isCreating,
    error: createError,
  } = useCreateProduct();

  const {
    currentStep,
    isSubmitting: isAssigning,
    error: assignError,
    franchises,
    isFranchisesLoading,
    handleAssignFranchise,
    goToStep2,
    resetFlow,
  } = useAssignProductFranchise(onSuccess);

  // ──────── Step 1: Product form fields ────────
  const [formData, setFormData] = useState<ProductCreatePayload>({
    SKU: "",
    name: "",
    description: "",
    content: "",
    image_url: "",
    images_url: [],
    min_price: 0,
    max_price: 0,
    is_have_topping: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ──────── Step 2: Assign franchise fields ────────
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [priceBase, setPriceBase] = useState<number>(0);

  // ──────── Reset khi đóng ────────
  const handleClose = () => {
    setFormData({
      SKU: "",
      name: "",
      description: "",
      content: "",
      image_url: "",
      images_url: [],
      min_price: 0,
      max_price: 0,
      is_have_topping: false,
    });
    setFormErrors({});
    setSelectedFranchiseId("");
    setSelectedSize("");
    setPriceBase(0);
    resetFlow();
    onClose();
  };

  if (!isOpen) return null;

  const error = createError || assignError;

  // ──────── Step 1: Validate & Submit ────────
  const handleStep1Change = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    let newValue: string | number = value;
    if (type === "number") newValue = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.SKU.trim()) errors.SKU = "SKU is required";
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    if (!formData.image_url.trim()) errors.image_url = "Main image is required";
    if (formData.min_price <= 0)
      errors.min_price = "Min price must be greater than 0";
    if (formData.max_price <= 0)
      errors.max_price = "Max price must be greater than 0";
    if (formData.max_price < formData.min_price)
      errors.max_price = "Max price must be ≥ min price";
    return errors;
  };

  const onSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    await createProduct(formData, (newProduct) => {
      goToStep2(newProduct.id);
    });
  };

  // ──────── Step 2: Validate & Submit ────────
  const isStep2Valid =
    selectedFranchiseId.trim() !== "" &&
    selectedSize.trim() !== "" &&
    priceBase > 0;

  const onSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleAssignFranchise({
        franchise_id: selectedFranchiseId,
        size: selectedSize,
        price_base: priceBase,
      });
      handleClose();
    } catch {
      // Error đã handle trong hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        {/* ═══════════ Header ═══════════ */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">
              {currentStep === 1
                ? "Create New Product"
                : "Assign Franchise"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {currentStep === 1
                ? "Step 1 of 2 — Enter product information"
                : "Step 2 of 2 — Select franchise, size and price"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">
              close
            </span>
          </button>
        </div>

        {/* ═══════════ Step Indicator ═══════════ */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-0">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep === 1
                    ? "bg-primary text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {currentStep > 1 ? (
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                ) : (
                  "1"
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 1 ? "text-gray-800" : "text-green-600"
                }`}
              >
                Create Product
              </span>
            </div>

            {/* Connector */}
            <div
              className={`flex-1 h-0.5 mx-3 rounded transition-colors ${
                currentStep > 1 ? "bg-green-500" : "bg-gray-200"
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep === 2
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 2 ? "text-gray-800" : "text-gray-400"
                }`}
              >
                Assign Franchise
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════ Error Banner ═══════════ */}
        {error && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">
              error
            </span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ═══════════ Step 1: Create Product ═══════════ */}
        {currentStep === 1 && (
          <form onSubmit={onSubmitStep1} className="flex flex-col flex-1">
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {/* SKU & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="SKU"
                    value={formData.SKU}
                    onChange={handleStep1Change}
                    placeholder="COFFEE_5"
                    className={`w-full h-10 px-3 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                      formErrors.SKU ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {formErrors.SKU && (
                    <p className="text-xs text-red-500">{formErrors.SKU}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleStep1Change}
                    placeholder="Coffee 5"
                    className={`w-full h-10 px-3 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                      formErrors.name ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>
              </div>

              {/* Min & Max Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Min Price (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="min_price"
                    value={formData.min_price || ""}
                    onChange={handleStep1Change}
                    placeholder="30000"
                    step="1000"
                    className={`w-full h-10 px-3 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                      formErrors.min_price
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {formErrors.min_price && (
                    <p className="text-xs text-red-500">
                      {formErrors.min_price}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Max Price (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="max_price"
                    value={formData.max_price || ""}
                    onChange={handleStep1Change}
                    placeholder="50000"
                    step="1000"
                    className={`w-full h-10 px-3 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                      formErrors.max_price
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {formErrors.max_price && (
                    <p className="text-xs text-red-500">
                      {formErrors.max_price}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleStep1Change}
                  placeholder="Short description of the product"
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-vertical ${
                    formErrors.description
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
                {formErrors.description && (
                  <p className="text-xs text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Content (CKEditor) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Content <span className="text-red-500">*</span>
                </label>
                <CKEditorField
                  value={formData.content}
                  onChange={(data) => {
                    setFormData((prev) => ({ ...prev, content: data }));
                    if (formErrors.content) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.content;
                        return next;
                      });
                    }
                  }}
                  placeholder="Enter product content here..."
                  hasError={!!formErrors.content}
                />
                {formErrors.content && (
                  <p className="text-xs text-red-500">{formErrors.content}</p>
                )}
              </div>

              {/* Main Image URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Main Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleStep1Change}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                    formErrors.image_url ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {formErrors.image_url && (
                  <p className="text-xs text-red-500">
                    {formErrors.image_url}
                  </p>
                )}
              </div>

              {/* Has Topping Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Has Topping
                  </p>
                  <p className="text-xs text-gray-500">
                    Can this product have additional toppings?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      is_have_topping: !prev.is_have_topping,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    formData.is_have_topping ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      formData.is_have_topping
                        ? "translate-x-5.5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer Step 1 */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    Creating...
                  </>
                ) : (
                  <>
                    Next
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════ Step 2: Assign Franchise ═══════════ */}
        {currentStep === 2 && (
          <form onSubmit={onSubmitStep2} className="flex flex-col flex-1">
            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {/* Success banner from Step 1 */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-[18px]">
                  check_circle
                </span>
                <p className="text-sm text-green-700 font-medium">
                  Product created successfully! Now assign a franchise.
                </p>
              </div>

              {/* Franchise Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Franchise <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                    storefront
                  </span>
                  <select
                    value={selectedFranchiseId}
                    onChange={(e) => setSelectedFranchiseId(e.target.value)}
                    className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">
                      {isFranchisesLoading
                        ? "Loading franchises..."
                        : "— Select a franchise —"}
                    </option>
                    {franchises.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Size Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                    straighten
                  </span>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">— Select a size —</option>
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.label} ({s.code})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Price Base */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Price Base (VND) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                    payments
                  </span>
                  <input
                    type="number"
                    value={priceBase || ""}
                    onChange={(e) =>
                      setPriceBase(parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g. 35000"
                    step="1000"
                    min="0"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Footer Step 2 */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={!isStep2Valid || isAssigning}
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      save
                    </span>
                    Save & Finish
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
