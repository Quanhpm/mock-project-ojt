import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Package, X } from "lucide-react";
import { z } from "zod";
import { SIZE_OPTIONS } from "@/types/product-option.type";
import type {
  ProductFranchiseDetail,
  ProductFranchiseUpdateRequest,
} from "../types/product-franchise.types";

interface ProductFranchiseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProductFranchiseDetail | null;
  productName?: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onSubmit: (payload: ProductFranchiseUpdateRequest) => Promise<void>;
}

interface EditFormValues {
  size: string;
  price_base: string;
}

const editProductFranchiseSchema = z.object({
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

export default function ProductFranchiseEditModal({
  isOpen,
  onClose,
  item,
  productName,
  isLoading = false,
  isSubmitting = false,
  onSubmit,
}: ProductFranchiseEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditFormValues>({
    defaultValues: {
      size: "",
      price_base: "",
    },
    resolver: zodResolver(editProductFranchiseSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) {
      reset({ size: "", price_base: "" });
      return;
    }

    if (item) {
      reset({
        size: item.size,
        price_base: String(item.price_base),
      });
    }
  }, [isOpen, item, reset]);

  if (!isOpen) return null;

  const sizeField = register("size");
  const priceBaseField = register("price_base");

  const submit = handleSubmit(async (values) => {
    await onSubmit({
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
              Edit Product Franchise
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update size and franchise price for this product.
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

        {isLoading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-8 text-slate-500">
            <LoaderCircle size={28} className="animate-spin text-[#8B4513]" />
            <p className="text-sm font-medium">Loading data for editing...</p>
          </div>
        ) : !item ? (
          <div className="px-6 py-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Product franchise data is unavailable.
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col">
            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-slate-200 bg-[#f9f5f1] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-[#8B4513] shadow-sm">
                    <Package size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Product</p>
                    <p className="text-base font-semibold text-slate-900">
                      {productName || item.product_id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Size
                  </label>
                  <select
                    {...sizeField}
                    className={`mt-2 h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-[#8B4513] focus:bg-white ${
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
                    step="any"
                    min="0"
                    {...priceBaseField}
                    placeholder="49000"
                    className={`mt-2 h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-[#8B4513] focus:bg-white ${
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
                disabled={isSubmitting || !isValid}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-[#8B4513] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d3610] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : null}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
