import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
 
// ─── QR Modal ────────────────────────────────────────────────
interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  qrValue?: string;
}
 
const fmt = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
 
export function QRPaymentModal({ isOpen, onClose, onConfirm, total, qrValue = "" }: QRPaymentModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
 
  if (!isOpen) return null;
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(63, 35, 15, 0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs rounded-3xl border overflow-hidden shadow-2xl"
        style={{ backgroundColor: "var(--cf-bg)", borderColor: "var(--cf-accent-light)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ backgroundColor: "var(--cf-surface)", borderColor: "var(--cf-accent-light)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--cf-accent-light)", color: "var(--cf-primary)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </span>
            <p className="font-bold text-base" style={{ color: "var(--cf-primary)" }}>
              QR Thanh Toán
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--cf-accent-light)", color: "var(--cf-secondary)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
 
        <div className="p-4 flex flex-col gap-2">
          {/* QR block */}
          <div
            className="rounded-2xl border p-4 flex flex-col items-center gap-3"
            style={{ backgroundColor: "var(--cf-surface)", borderColor: "var(--cf-accent-light)" }}
          >
            <div
              className="rounded-2xl p-3 border"
              style={{ backgroundColor: "#fff", borderColor: "var(--cf-accent-light)" }}
            >
              <QRCodeCanvas
                value={qrValue}
                size={190}
                bgColor="#ffffff"
                fgColor="#7F5539"
                level="H"
              />
            </div>
            <p className="text-xs text-center leading-relaxed" style={{ color: "var(--cf-secondary)" }}>
              Mở ứng dụng ngân hàng và quét mã QR để hoàn tất thanh toán
            </p>
          </div>
 
          {/* Tổng tiền */}
          <div
            className="rounded-2xl border px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: "var(--cf-surface)", borderColor: "var(--cf-accent-light)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--cf-secondary)" }}>
              Tổng tiền
            </span>
            <span className="text-base font-extrabold" style={{ color: "var(--cf-dark)" }}>
              {fmt(total)}
            </span>
          </div>
 
          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border text-sm font-semibold"
              style={{ backgroundColor: "var(--cf-surface)", borderColor: "var(--cf-secondary)", color: "var(--cf-secondary)" }}
            >
              Huỷ
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-3 rounded-2xl text-white text-sm font-bold"
              style={{ backgroundColor: "var(--cf-primary)" }}
            >
              Đã thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}