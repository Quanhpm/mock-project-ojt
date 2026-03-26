import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAssignProductFranchise } from "../hooks/useAssignProductFranchise.hook";
import { useProductFranchiseAssignments } from "../hooks/useProductFranchiseAssignments.hook";
import { productApi, type ProductItem } from "@/apis/endpoints/product.api";
import { formatCurrency } from "@/utils/format.util";

// ======================== Props ========================

interface AssignFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /**
   * Nếu truyền productId → bỏ qua Step 1, nhảy thẳng Step 2 (Luồng 2 — từ Table).
   * Nếu KHÔNG truyền → hiện cả 2 bước (Luồng 1 — tạo mới Product).
   */
  productId?: string;
  productName?: string;
}

interface AssignFranchiseFormValues {
  franchise_id: string;
  size: string;
  price_base_input: string;
  use_default_product: boolean;
}

const DEFAULT_FORM_VALUES: AssignFranchiseFormValues = {
  franchise_id: "",
  size: "",
  price_base_input: "",
  use_default_product: false,
};

const formatPriceInput = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  return new Intl.NumberFormat("vi-VN").format(Number(digitsOnly));
};

const parsePriceInput = (value: string): number => {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

// ======================== Component ========================

export default function AssignFranchiseModal({
  isOpen,
  onClose,
  onSuccess,
  productId,
  productName,
}: AssignFranchiseModalProps) {
  const {
    currentStep,
    isSubmitting,
    error,
    franchises,
    isFranchisesLoading,
    handleAssignFranchise,
    initWithProductId,
    resetFlow,
  } = useAssignProductFranchise(undefined);
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const lastManualSizeRef = useRef<string>("");
  const hasSuccessfulSubmitRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isValid },
  } = useForm<AssignFranchiseFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  // ──────── Assigned franchises for this product ────────
  const { assignments, isLoading: isAssignmentsLoading, refresh: refreshAssignments } =
    useProductFranchiseAssignments(productId);

  const selectedFranchiseId = watch("franchise_id");
  const selectedSize = watch("size");
  const priceBaseInput = watch("price_base_input");
  const useDefaultProduct = watch("use_default_product");
  const priceBase = parsePriceInput(priceBaseInput);

  const assignedSizes = useMemo(
    () => new Set(assignments.map((item) => item.size.toLowerCase())),
    [assignments],
  );

  const validatePriceBase = (value: string) => {
    const numericValue = parsePriceInput(value);

    if (numericValue <= 0) {
      return "Price must be greater than 0";
    }

    if (
      product &&
      typeof product.min_price === "number" &&
      typeof product.max_price === "number"
    ) {
      if (numericValue < product.min_price || numericValue > product.max_price) {
        return `Price must be between ${formatCurrency(product.min_price)} and ${formatCurrency(product.max_price)}`;
      }
    }

    return true;
  };

  const franchiseField = register("franchise_id", {
    required: "Please select a franchise",
  });

  const sizeField = register("size", {
    validate: (value) => {
      if (useDefaultProduct) {
        return true;
      }

      if (!value) {
        return "Please enter a size";
      }

      const normalizedSize = value.toLowerCase();
      if (assignedSizes.has(normalizedSize)) {
        return `Size "${value}" has already been assigned for this product`;
      }

      return true;
    },
  });

  const priceBaseField = register("price_base_input", {
    validate: validatePriceBase,
  });

  // ──────── Init cho Luồng 2 (từ Table) ────────
  useEffect(() => {
    if (isOpen && productId) {
      initWithProductId(productId);
    }
  }, [isOpen, productId, initWithProductId]);

  useEffect(() => {
    if (!isOpen || !productId) {
      setProduct(null);
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      setIsProductLoading(true);

      try {
        const response = await productApi.getProductById(productId);
        if (!cancelled) {
          setProduct(response);
        }
      } catch (fetchError) {
        if (!cancelled) {
          console.error("Failed to fetch product detail for assign franchise modal:", fetchError);
          setProduct(null);
        }
      } finally {
        if (!cancelled) {
          setIsProductLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [isOpen, productId]);

  // ──────── Reset khi đóng modal ────────
  const handleClose = () => {
    const shouldNotifySuccess = hasSuccessfulSubmitRef.current;

    hasSuccessfulSubmitRef.current = false;
    lastManualSizeRef.current = "";
    reset(DEFAULT_FORM_VALUES);
    setProduct(null);
    resetFlow();
    if (shouldNotifySuccess) {
      onSuccess?.();
    }
    onClose();
  };

  if (!isOpen || currentStep !== 2) return null;

  const isSubmitDisabled =
    !isValid ||
    isSubmitting ||
    isProductLoading ||
    selectedFranchiseId.trim() === "" ||
    (!useDefaultProduct && selectedSize.trim() === "") ||
    priceBase <= 0;

  const handleDefaultProductToggle = () => {
    const nextValue = !useDefaultProduct;

    if (nextValue) {
      lastManualSizeRef.current = selectedSize;
      clearErrors("size");
      setValue("use_default_product", true, { shouldDirty: true });
      setValue("size", "DEFAULT", {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setValue("use_default_product", false, { shouldDirty: true });
    setValue("size", lastManualSizeRef.current, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (formValues: AssignFranchiseFormValues) => {
    try {
      if (!useDefaultProduct) {
        const normalizedSize = formValues.size.toLowerCase();
        if (assignedSizes.has(normalizedSize)) {
          setError("size", {
            type: "manual",
            message: `Size "${formValues.size}" has already been assigned for this product`,
          });
          return;
        }
      }

      await handleAssignFranchise({
        franchise_id: formValues.franchise_id,
        size: formValues.size,
        price_base: priceBase,
      });

      hasSuccessfulSubmitRef.current = true;
      lastManualSizeRef.current = "";
      reset(DEFAULT_FORM_VALUES);
      refreshAssignments();
    } catch {
      // Error is already handled in the hook.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
        {/* ═══════════ Header ═══════════ */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">
              Assign Franchise
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {productName
                ? `Assign "${productName}" to a franchise`
                : "Select franchise, size and price for this product"}
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

        {/* ═══════════ Error Banner ═══════════ */}
        {error && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 sm:mx-6">
            <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">
              error
            </span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ═══════════ Form ═══════════ */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="space-y-5 p-4 sm:p-6">
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
                  {...franchiseField}
                  className={`w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer ${
                    errors.franchise_id ? "border-red-300" : "border-gray-200"
                  }`}
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
              {errors.franchise_id && (
                <p className="text-xs text-red-600">{errors.franchise_id.message}</p>
              )}
            </div>

            {/* Default Size Button - Fixed Position */}
            <button
              type="button"
              onClick={handleDefaultProductToggle}
              aria-pressed={useDefaultProduct}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all ${
                useDefaultProduct
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {useDefaultProduct ? "lock" : "lock_open"}
              </span>
              Default Size
            </button>

            {/* Size Input (hidden when useDefaultProduct) */}
            {!useDefaultProduct && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                    straighten
                  </span>
                  <input
                    name={sizeField.name}
                    ref={sizeField.ref}
                    onBlur={sizeField.onBlur}
                    type="text"
                    autoComplete="off"
                    value={selectedSize}
                    onChange={(event) => {
                      const nextSize = event.target.value;
                      lastManualSizeRef.current = nextSize;
                      setValue("size", nextSize, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    placeholder="e.g., S, M, L, XL"
                    className={`w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                      errors.size ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.size && (
                  <p className="text-xs text-red-600">{errors.size.message}</p>
                )}
              </div>
            )}

            {/* Default Product Info (shown when useDefaultProduct) */}
            {useDefaultProduct && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Size <span className="text-primary">default</span>
                </label>
              </div>
            )}

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
                  name={priceBaseField.name}
                  ref={priceBaseField.ref}
                  onBlur={priceBaseField.onBlur}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={priceBaseInput}
                  onChange={(event) => {
                    setValue(
                      "price_base_input",
                      formatPriceInput(event.target.value),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );
                  }}
                  placeholder="e.g. 30.000 (VND)"
                  className={`w-full h-10 pl-9 pr-16 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                    errors.price_base_input ? "border-red-300" : "border-gray-200"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  VND
                </span>
              </div>
              {product &&
                typeof product.min_price === "number" &&
                typeof product.max_price === "number" && (
                <p className="text-xs text-gray-500">
                  Allowed range: {formatCurrency(product.min_price)} to {formatCurrency(product.max_price)}
                </p>
              )}
              {errors.price_base_input && (
                <p className="text-xs text-red-600">{errors.price_base_input.message}</p>
              )}
            </div>
          </div>

          {/* ═══════════ Assigned Franchises ═══════════ */}
          <div className="px-6 pb-5 pt-1">
            <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  badge
                </span>
                <h3 className="text-sm font-semibold text-gray-700">
                  Assigned Roles &amp; Franchises
                </h3>
              </div>

              <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-white">
                <span>Size</span>
                <span>Franchise</span>
                <span className="text-right">Price</span>
              </div>

              {isAssignmentsLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-gray-400 bg-white">
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : assignments.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm text-gray-400 bg-white">
                  No franchises assigned yet
                </div>
              ) : (
                <div
                  className={assignments.length > 3 ? "max-h-[192px] overflow-y-auto" : ""}
                >
                  {assignments.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-3 items-center px-4 py-3 border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
                        {item.size}
                      </span>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="material-symbols-outlined text-gray-400 text-[16px]">
                          storefront
                        </span>
                        <span className="font-medium">
                          {item.franchise_name ?? item.franchise_id}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <span className="text-sm font-semibold text-gray-700">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.price_base)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══════════ Footer ═══════════ */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6c4830] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
              {isSubmitting ? (
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
                  Assign Franchise
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
