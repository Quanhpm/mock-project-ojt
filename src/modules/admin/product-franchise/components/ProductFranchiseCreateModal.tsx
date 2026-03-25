import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Package, Store, X } from "lucide-react";
import { z } from "zod";
import { productApi, type ProductItem } from "@/apis/endpoints/product.api";
import { SIZE_OPTIONS } from "@/types/product-option.type";
import type { ProductFranchiseCreateRequest } from "../types/product-franchise.types";

interface ProductFranchiseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductFranchiseCreateRequest) => Promise<void>;
  franchiseId: string;
  franchiseName?: string;
  isSubmitting?: boolean;
}

interface CreateFormValues {
  product_id: string;
  size: string;
  price_base: string;
}

type ProductOption = Pick<
  ProductItem,
  "id" | "name" | "SKU" | "min_price" | "max_price"
>;

const DEFAULT_VALUES: CreateFormValues = {
  product_id: "",
  size: "",
  price_base: "",
};

const createProductFranchiseSchema = z.object({
  product_id: z.string().trim().min(1, "Please select a product."),
  size: z.string().trim().min(1, "Size is required."),
  price_base: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .superRefine((value, context) => {
      const parsed = Number(value);

      if (!Number.isFinite(parsed) || parsed <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a number greater than 0",
        });
        return;
      }

      if (!Number.isInteger(parsed)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter an integer",
        });
      }
    }),
});

const formatPrice = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProductFranchiseCreateModal({
  isOpen,
  onClose,
  onSubmit,
  franchiseId,
  franchiseName,
  isSubmitting = false,
}: ProductFranchiseCreateModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<CreateFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(createProductFranchiseSchema),
    mode: "onChange",
  });
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const selectedProductId = watch("product_id");
  const selectedProduct = useMemo(
    () => productOptions.find((item) => item.id === selectedProductId) ?? null,
    [productOptions, selectedProductId],
  );

  useEffect(() => {
    if (!isOpen) {
      reset(DEFAULT_VALUES);
      setProductOptions([]);
      setProductsError(null);
      setIsProductsLoading(false);
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      setIsProductsLoading(true);
      setProductsError(null);

      try {
        const response = await productApi.searchProducts({
          searchCondition: {
            is_active: true,
            is_deleted: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 1000,
          },
        });

        if (!cancelled) {
          const nextOptions = [...(response.data ?? [])].sort((left, right) =>
            left.name.localeCompare(right.name),
          );
          setProductOptions(nextOptions);
        }
      } catch (error) {
        if (!cancelled) {
          setProductOptions([]);
          setProductsError(
            error instanceof Error ? error.message : "Failed to load products.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const productField = register("product_id", {
    required: "Please select a product.",
  });
  const sizeField = register("size");
  const priceBaseField = register("price_base", {
    validate: (value) => {
      const parsed = Number(value);

      if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        return true;
      }

      if (
        selectedProduct &&
        typeof selectedProduct.min_price === "number" &&
        parsed < selectedProduct.min_price
      ) {
        return `Price must be at least ${formatPrice(selectedProduct.min_price)}.`;
      }

      if (
        selectedProduct &&
        typeof selectedProduct.max_price === "number" &&
        parsed > selectedProduct.max_price
      ) {
        return `Price must not exceed ${formatPrice(selectedProduct.max_price)}.`;
      }

      return true;
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      franchise_id: franchiseId,
      product_id: values.product_id,
      size: values.size.trim().toUpperCase(),
      price_base: Number(values.price_base),
    });
  });

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/45 px-4 py-6"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_32px_60px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8B4513]">
              Product Franchise
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Create Product
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a master product into the currently selected franchise.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col">
          <div className="space-y-5 px-6 py-6">
            <div className="rounded-2xl border border-slate-200 bg-[#f9f5f1] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[#8B4513] shadow-sm">
                  <Store size={22} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Current Franchise</p>
                  <p className="text-base font-semibold text-slate-900">
                    {franchiseName || franchiseId}
                  </p>
                </div>
              </div>
            </div>

            {productsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {productsError}
              </div>
            ) : null}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Product
              </label>
              <div className="relative mt-2">
                <Package
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  {...productField}
                  onChange={(event) => {
                    productField.onChange(event);
                    const nextProduct = productOptions.find(
                      (item) => item.id === event.target.value,
                    );

                    if (nextProduct?.min_price) {
                      setValue("price_base", String(nextProduct.min_price), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      return;
                    }

                    if (!getValues("price_base")) {
                      setValue("price_base", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  disabled={isProductsLoading || isSubmitting}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#8B4513] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {isProductsLoading ? "Loading products..." : "Select a product"}
                  </option>
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                      {product.SKU ? ` (${product.SKU})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {errors.product_id ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.product_id.message}
                </p>
              ) : null}
              {selectedProduct ? (
                <p className="mt-2 text-xs text-slate-500">
                  Suggested base range: {formatPrice(selectedProduct.min_price)} to{" "}
                  {formatPrice(selectedProduct.max_price)}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Size
                </label>
                <select
                  {...sizeField}
                  disabled={isSubmitting}
                  className={`mt-2 h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-[#8B4513] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.size ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <option value="">Select size</option>
                  {SIZE_OPTIONS.map((sizeOption) => (
                    <option key={sizeOption.code} value={sizeOption.code}>
                      {sizeOption.label}
                    </option>
                  ))}
                </select>
                {errors.size ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.size.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Price Base (VND)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...priceBaseField}
                  placeholder="50000"
                  disabled={isSubmitting}
                  className={`mt-2 h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-[#8B4513] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.price_base ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.price_base ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.price_base.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isProductsLoading || !isValid}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-[#8B4513] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d3610] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : null}
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


