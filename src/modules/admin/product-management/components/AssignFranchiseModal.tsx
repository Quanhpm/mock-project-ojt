import React, { useState, useEffect } from "react";
import { useAssignProductFranchise } from "../hooks/useAssignProductFranchise.hook";
import { useProductFranchiseAssignments } from "../hooks/useProductFranchiseAssignments.hook";
import { SIZE_OPTIONS } from "@/types/product-option.type";

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

  // ──────── Form fields ────────
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [priceBase, setPriceBase] = useState<number>(0);

  // ──────── Assigned franchises for this product ────────
  const { assignments, isLoading: isAssignmentsLoading, refresh: refreshAssignments } =
    useProductFranchiseAssignments(productId);

  // ──────── Init cho Luồng 2 (từ Table) ────────
  useEffect(() => {
    if (isOpen && productId) {
      initWithProductId(productId);
    }
  }, [isOpen, productId, initWithProductId]);

  // ──────── Reset khi đóng modal ────────
  const handleClose = () => {
    setSelectedFranchiseId("");
    setSelectedSize("");
    setPriceBase(0);
    resetFlow();
    onSuccess?.();
    onClose();
  };

  if (!isOpen || currentStep !== 2) return null;

  // ──────── Validate ────────
  const isFormValid =
    selectedFranchiseId.trim() !== "" &&
    selectedSize.trim() !== "" &&
    priceBase > 0;

  // ──────── Submit ────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleAssignFranchise({
        franchise_id: selectedFranchiseId,
        size: selectedSize,
        price_base: priceBase,
      });
      // Reset form fields but keep modal open — refresh list to show new assignment
      setSelectedFranchiseId("");
      setSelectedSize("");
      setPriceBase(0);
      refreshAssignments();
    } catch {
      // Error đã được handle trong hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        {/* ═══════════ Header ═══════════ */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
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
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">
              error
            </span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ═══════════ Form ═══════════ */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1">
          <div className="overflow-y-auto p-6 space-y-5 flex-1">
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

          {/* ═══════════ Footer ═══════════ */}
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
              disabled={!isFormValid || isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* ═══════════ Assigned Franchises ═══════════ */}
        <div className="px-6 pb-6 pt-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
              <span className="material-symbols-outlined text-primary text-[20px]">
                badge
              </span>
              <h3 className="text-sm font-semibold text-gray-700">
                Assigned Roles &amp; Franchises
              </h3>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-white">
              <span>Size</span>
              <span>Franchise</span>
              <span className="text-right">Price</span>
            </div>

            {/* Rows */}
            {isAssignmentsLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span className="text-sm">Loading...</span>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-gray-400">
                No franchises assigned yet
              </div>
            ) : (
              assignments.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-3 items-center px-4 py-3 border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 transition-colors"
                >
                  {/* Size badge */}
                  <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
                    {item.size}
                  </span>

                  {/* Franchise name */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="material-symbols-outlined text-gray-400 text-[16px]">
                      storefront
                    </span>
                    <span className="font-medium">
                      {item.franchise_name ?? item.franchise_id}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold text-gray-700">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price_base)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
