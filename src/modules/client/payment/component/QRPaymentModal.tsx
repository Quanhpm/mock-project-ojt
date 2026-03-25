import { useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Banknote, QrCode, ScanLine, X } from "lucide-react";
import { formatCurrency } from "@/utils";

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  qrValue?: string;
  selectedPayment: string;
}

const paymentLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  MOMO: "Ví MoMo",
  CARD: "Thẻ ngân hàng",
  VNPAY: "VNPay",
};

export function QRPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  total,
  qrValue = "",
  selectedPayment,
}: QRPaymentModalProps) {
  const isCashPayment = selectedPayment === "CASH";
  const paymentLabel = paymentLabels[selectedPayment] ?? selectedPayment;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(63,35,15,0.48)] px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-[var(--cf-primary)]/10 bg-[var(--cf-bg)] shadow-[0_28px_72px_rgba(63,35,15,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(135deg,rgba(127,85,57,0.14),rgba(230,204,178,0.32))]" />

        <div className="relative flex items-center justify-between border-b border-[var(--cf-primary)]/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[var(--cf-primary)] text-white shadow-[0_12px_22px_rgba(127,85,57,0.14)]">
              {isCashPayment ? (
                <Banknote className="h-4.5 w-4.5" />
              ) : (
                <QrCode className="h-4.5 w-4.5" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--cf-secondary)]">
                Xác nhận thanh toán
              </p>
              <h3 className="mt-1 text-lg font-black text-[var(--cf-primary)]">
                {paymentLabel}
              </h3>
            </div>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--cf-primary)]/10 bg-white/80 text-[var(--cf-primary)] transition-colors hover:bg-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative space-y-3 p-4">
          <div className="rounded-[24px] border border-[var(--cf-primary)]/10 bg-white/80 p-4">
            {isCashPayment ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--cf-accent-light)] text-[var(--cf-primary)]">
                  <Banknote className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--cf-primary)]">
                    Thanh toán bằng tiền mặt
                  </p>
                  <p className="mt-1.5 text-sm leading-5 text-[var(--cf-dark)]">
                    Bạn sẽ thanh toán trực tiếp khi nhận món hoặc tại quầy.
                    Nhấn xác nhận để hoàn tất bước checkout cho đơn hàng này.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-3 flex items-center gap-2 rounded-full bg-[var(--cf-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--cf-primary)]">
                  <ScanLine className="h-3.5 w-3.5" />
                  Quét mã bằng ứng dụng thanh toán
                </div>

                <div className="rounded-[24px] border border-[var(--cf-primary)]/10 bg-white p-3 shadow-[0_14px_28px_rgba(127,85,57,0.08)]">
                  <QRCodeCanvas
                    bgColor="#ffffff"
                    fgColor="#7F5539"
                    level="H"
                    size={184}
                    value={qrValue}
                  />
                </div>

                <p className="mt-3 text-center text-sm leading-5 text-[var(--cf-dark)]">
                  Mở ứng dụng {paymentLabel}, quét mã QR và quay lại đây để xác
                  nhận đơn hàng.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-[var(--cf-primary)]/10 bg-[linear-gradient(135deg,rgba(230,204,178,0.72),rgba(255,255,255,0.95))] px-4 py-3.5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--cf-secondary)]">
                  Tổng thanh toán
                </p>
                <p className="mt-1 text-xl font-black tracking-tight text-[var(--cf-primary)]">
                  {formatCurrency(total)}
                </p>
              </div>

              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--cf-primary)]">
                {paymentLabel}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-full border border-[var(--cf-primary)]/12 bg-white py-3 text-sm font-semibold text-[var(--cf-primary)] transition-colors hover:bg-[var(--cf-bg)]"
              onClick={onClose}
              type="button"
            >
              Quay Lại
            </button>
            <button
              className="flex-1 rounded-full bg-[linear-gradient(135deg,rgba(127,85,57,1),rgba(156,102,68,1))] py-3 text-sm font-bold text-white shadow-[0_16px_28px_rgba(127,85,57,0.2)] transition-opacity hover:opacity-95"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              type="button"
            >
              Thanh Toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
