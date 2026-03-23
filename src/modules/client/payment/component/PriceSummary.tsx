import type { OrderResponse } from "@/apis/endpointsCLIENT/payment.api";
import { ROUTER_URL } from "@/routes/router.const";
import { formatCurrency } from "@/utils";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SummaryRowProps {
  label: string;
  value: number;
  muted?: boolean;
}

interface PriceSummaryProps {
  orderData?: OrderResponse | null;
  paying: boolean;
  selectedPaymentLabel: string;
  disabled?: boolean;
  onConfirmPayment: () => void;
}

function SummaryRow({ label, value, muted = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-[var(--cf-secondary)]">{label}</span>
      <span
        className={`font-semibold ${
          muted ? "text-[var(--cf-dark)]" : "text-[var(--cf-primary)]"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function PriceSummary({
  orderData,
  paying,
  selectedPaymentLabel,
  disabled = false,
  onConfirmPayment,
}: PriceSummaryProps) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const discounts = [
    {
      label: "Giảm giá promotion",
      value: orderData?.promotion_discount ?? 0,
    },
    {
      label: "Giảm giá voucher",
      value: orderData?.voucher_discount ?? 0,
    },
    {
      label: "Giảm giá điểm",
      value: orderData?.loyalty_discount ?? 0,
    },
  ].filter((discount) => discount.value > 0);

  return (
    <>
      <section className="rounded-[22px] border border-[var(--cf-primary)]/10 bg-white/88 p-3.5 shadow-[0_16px_36px_rgba(127,85,57,0.07)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--cf-secondary)]">
              Thanh toán
            </p>
            <h2 className="mt-0.5 text-[15px] font-bold text-[var(--cf-primary)]">
              Tổng thanh toán
            </h2>
          </div>

          <span className="rounded-full border border-[var(--cf-primary)]/10 bg-[var(--cf-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--cf-primary)]">
            {selectedPaymentLabel}
          </span>
        </div>

        <div className="mt-3 rounded-[16px] bg-[var(--cf-bg)]/78 px-3.5 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--cf-secondary)]">
            Thành tiền
          </p>
          <p className="mt-1 text-[28px] font-black tracking-tight text-[var(--cf-primary)]">
            {formatCurrency(orderData?.final_amount ?? 0)}
          </p>
        </div>

        <div className="mt-3 space-y-2">
          <SummaryRow label="Tạm tính" muted value={orderData?.subtotal_amount ?? 0} />

          {discounts.map((discount) => (
            <div
              className="flex items-center justify-between gap-3 text-[13px]"
              key={discount.label}
            >
              <span className="text-[var(--cf-secondary)]">{discount.label}</span>
              <span className="font-semibold text-[var(--cf-primary)]">
                - {formatCurrency(discount.value)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-3 h-px bg-[var(--cf-primary)]/10" />

        <button
          className={`mt-3 flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(127,85,57,0.18)] transition-all duration-300 ${
            disabled || paying
              ? "bg-[var(--cf-primary)]/55"
              : "bg-[linear-gradient(135deg,rgba(127,85,57,1),rgba(156,102,68,1))] hover:-translate-y-0.5"
          }`}
          disabled={disabled || paying}
          onClick={onConfirmPayment}
          type="button"
        >
          {paying ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 0 1 8-8v8H4Z"
                  fill="currentColor"
                />
              </svg>
              Đang xử lý thanh toán...
            </>
          ) : (
            `Thanh toán ${formatCurrency(orderData?.final_amount ?? 0)}`
          )}
        </button>

        <button
          className="mt-2.5 w-full rounded-full border border-[var(--cf-primary)]/12 bg-white py-2.5 text-sm font-semibold text-[var(--cf-primary)] transition-colors hover:bg-[var(--cf-bg)]"
          onClick={() => setShowModal(true)}
          type="button"
        >
          Thoát đơn
        </button>
      </section>

      {showModal && (
        <ConfirmModal
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            navigate(ROUTER_URL.HOME_ROUTER.CART);
          }}
        />
      )}
    </>
  );
}

interface ConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmModal({ onClose, onConfirm }: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(63,35,15,0.45)] px-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-[28px] border border-[var(--cf-primary)]/10 bg-white p-6 shadow-[0_30px_80px_rgba(63,35,15,0.26)]">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cf-accent-light)] text-[var(--cf-primary)]">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold text-[var(--cf-primary)]">
          Hủy thanh toán
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--cf-dark)]">
          Nếu thoát khỏi trang này, bạn sẽ cần quay lại giỏ hàng để tiếp tục
          đặt món. Bạn có chắc muốn rời khỏi bước thanh toán không?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 rounded-2xl border border-[var(--cf-primary)]/12 bg-white py-3 text-sm font-semibold text-[var(--cf-primary)] transition-colors hover:bg-[var(--cf-bg)]"
            onClick={onClose}
            type="button"
          >
            Ở lại
          </button>
          <button
            className="flex-1 rounded-2xl bg-[var(--cf-primary)] py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(127,85,57,0.18)] transition-opacity hover:opacity-95"
            onClick={onConfirm}
            type="button"
          >
            Xác nhận thoát
          </button>
        </div>
      </div>
    </div>
  );
}
