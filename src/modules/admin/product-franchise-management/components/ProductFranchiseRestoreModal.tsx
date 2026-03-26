import { LoaderCircle, RotateCcw, X } from "lucide-react";
import type { ProductFranchiseSearchItem } from "../types/product-franchise.types";

interface ProductFranchiseRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: ProductFranchiseSearchItem | null;
  isSubmitting?: boolean;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductFranchiseRestoreModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  isSubmitting = false,
}: ProductFranchiseRestoreModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/45 px-4 py-6"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_32px_60px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <RotateCcw size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Restore Product Franchise
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Bring this deleted item back to the current list.
              </p>
            </div>
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

        <div className="space-y-4 px-6 py-6">
          <p className="text-sm leading-6 text-slate-600">
            The product franchise will be restored and shown again in the Current list.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Product
                </p>
                <p className="mt-2 font-medium">
                  {item?.product_name || item?.product_id || "--"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Size
                </p>
                <p className="mt-2 font-medium">{item?.size || "--"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Price
                </p>
                <p className="mt-2 font-medium">
                  {item ? formatPrice(item.price_base) : "--"}
                </p>
              </div>
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
            type="button"
            onClick={() => {
              void onConfirm();
            }}
            disabled={isSubmitting}
            className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <RotateCcw size={16} />
            )}
            {isSubmitting ? "Restoring..." : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
