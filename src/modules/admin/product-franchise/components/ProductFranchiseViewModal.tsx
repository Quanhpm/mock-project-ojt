import { LoaderCircle, Package, Store, X } from "lucide-react";
import type { ProductFranchiseDetail } from "../types/product-franchise.types";

interface ProductFranchiseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProductFranchiseDetail | null;
  productName?: string;
  franchiseName?: string;
  isLoading?: boolean;
  error?: string | null;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
      {label}
    </p>
    <p className="mt-3 text-base font-semibold leading-6 text-slate-900">
      {value}
    </p>
  </div>
);

export default function ProductFranchiseViewModal({
  isOpen,
  onClose,
  item,
  productName,
  franchiseName,
  isLoading = false,
  error = null,
}: ProductFranchiseViewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/45 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_32px_60px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8B4513]">
              Product Franchise
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              View Detail
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review franchise-specific product information before making any
              changes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
              <LoaderCircle size={28} className="animate-spin text-[#8B4513]" />
              <p className="text-sm font-medium">Loading product franchise...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : !item ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Product franchise data is unavailable.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-[26px] border border-[#eadfd6] bg-[linear-gradient(135deg,#fcfaf7_0%,#f7efe8_100%)] p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center rounded-full border border-[#e8d8ca] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B4513]">
                      Current Item
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-4 shadow-sm ring-1 ring-white/70">
                        <div className="rounded-2xl bg-white p-3 text-[#8B4513] shadow-sm">
                          <Package size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Product Name
                          </p>
                          <p className="mt-2 text-lg font-semibold leading-7 text-slate-900">
                            {productName || item.product_id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-4 shadow-sm ring-1 ring-white/70">
                        <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                          <Store size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Franchise Name
                          </p>
                          <p className="mt-2 text-lg font-semibold leading-7 text-slate-900">
                            {franchiseName || item.franchise_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[220px] flex-col justify-between rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm md:max-w-[240px]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Status
                      </p>
                      <div className="mt-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                            item.is_active
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-[#f8f4ef] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Current Price
                      </p>
                      <p className="mt-2 text-2xl font-bold leading-none text-[#8B4513]">
                        {formatPrice(item.price_base)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <DetailRow label="Size" value={item.size} />
                <DetailRow
                  label="Price"
                  value={formatPrice(item.price_base)}
                />
                <DetailRow
                  label="Status"
                  value={item.is_active ? "Active" : "Inactive"}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
