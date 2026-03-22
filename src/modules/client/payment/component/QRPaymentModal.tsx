import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

// ─── QR Modal ────────────────────────────────────────────────
interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  qrValue?: string;
  selectedPayment: string;
}

const fmt = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export function QRPaymentModal({ isOpen, onClose, onConfirm, total, qrValue = "", selectedPayment }: QRPaymentModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(63,35,15,0.5)] px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-[var(--cf-accent-light)] bg-[var(--cf-bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--cf-accent-light)] bg-[var(--cf-surface)] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-primary)]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </span>
            <p className="text-base font-bold text-[var(--cf-primary)]">
              Thanh Toán
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-secondary)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {/* QR block */}
          {selectedPayment !== "CASH" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4">
              <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-white p-3">
                <QRCodeCanvas
                  value={qrValue}
                  size={190}
                  bgColor="#ffffff"
                  fgColor="#7F5539"
                  level="H"
                />
              </div>
              <p className="text-center text-xs leading-relaxed text-[var(--cf-secondary)]">
                Mở ứng dụng ngân hàng và quét mã QR để hoàn tất thanh toán
              </p>
            </div>
          )}
          
          {/* Tổng tiền */}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--cf-secondary)]">
              Tổng tiền
            </span>
            <span className="text-base font-extrabold text-[var(--cf-dark)]">
              {fmt(total)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[var(--cf-secondary)] bg-white py-3 text-sm font-semibold text-[var(--cf-primary)]"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 rounded-2xl bg-[var(--cf-primary)] py-3 text-sm font-bold text-white"
            >
              Kiểm tra đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}