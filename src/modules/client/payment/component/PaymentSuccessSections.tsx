import type { ReactNode } from "react";
import { useState } from "react";
import {
  Check,
  CircleCheck,
  Clock3,
  Copy,
  CreditCard,
  Home,
  MapPin,
  Store,
  User,
} from "lucide-react";
import { paymentMethods } from "./payment-methods";

interface SuccessHeaderProps {
  title?: string;
  description?: string;
}

interface CustomerInfoProps {
  name?: string;
  phone?: string;
  address?: string;
  franchiseName?: string;
}

interface PaymentDetailsProps {
  formattedTotal: string;
  paymentCode?: string;
  paymentMethod?: string;
  paidAt?: string;
}

interface ActionButtonsProps {
  onGoHome: () => void;
  onCancel: () => void;
}

function InfoRow({
  icon,
  label,
  title,
  subtitle,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(176,137,104,0.2)] bg-white shadow-sm">
        {icon}
      </div>

      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--cf-secondary)]">
          {label}
        </p>
        <p className="text-base font-bold leading-snug text-[var(--cf-primary)]">
          {title}
        </p>
        {subtitle && (
          <p className="mt-1 text-sm font-medium text-[var(--cf-dark)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function PaymentDetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-semibold text-[var(--cf-dark)]">{label}</span>
      <div className="text-right text-[var(--cf-primary)]">{value}</div>
    </div>
  );
}

export function SuccessHeader({
  title = "Thanh toán thành công",
  description = "Cảm ơn bạn! Đơn hàng đã được xác nhận và đang được chuẩn bị.",
}: SuccessHeaderProps) {
  return (
    <section className="mb-12 flex flex-col items-center text-center lg:items-start lg:text-left">
      <div className="relative mb-8 transition-transform duration-300 ease-out">
        <div className="absolute inset-0 scale-125 rounded-full bg-[var(--cf-primary)]/10 blur-3xl" />

        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[var(--cf-accent-light)]/45 shadow-[0_20px_42px_rgba(127,85,57,0.14)]">
          <CircleCheck
            className="h-14 w-14 text-[var(--cf-primary)]"
            strokeWidth={2.2}
          />
        </div>
      </div>

      <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[var(--cf-primary)] md:text-4xl">
        {title}
      </h2>
      <p className="text-lg font-medium text-[var(--cf-dark)]">
        {description}
      </p>
    </section>
  );
}

export function CustomerInfo({
  name,
  phone,
  address,
  franchiseName,
}: CustomerInfoProps) {
  return (
    <section className="rounded-[2rem] border border-[rgba(176,137,104,0.18)] bg-[var(--cf-bg)] p-8">
      <div className="mb-8 flex items-center gap-3 text-[var(--cf-primary)]">
        <User className="h-7 w-7" />
        <h3 className="text-xl font-bold uppercase tracking-[0.14em]">
          Thông tin nhận hàng
        </h3>
      </div>

      <div className="space-y-8">
        <InfoRow
          icon={<User className="h-5 w-5 text-[var(--cf-primary)]" />}
          label="Người nhận"
          subtitle={phone || "Chưa cập nhật số điện thoại"}
          title={name || "Chưa cập nhật tên khách hàng"}
        />
        <InfoRow
          icon={<MapPin className="h-5 w-5 text-[var(--cf-primary)]" />}
          label="Địa chỉ giao tới"
          title={address || "Chưa cập nhật địa chỉ giao hàng"}
        />
        <InfoRow
          icon={<Store className="h-5 w-5 text-[var(--cf-primary)]" />}
          label="Cửa hàng thực hiện"
          title={franchiseName || "Chưa cập nhật cửa hàng"}
        />
      </div>
    </section>
  );
}

export function PaymentDetails({
  formattedTotal,
  paymentCode,
  paymentMethod,
  paidAt,
}: PaymentDetailsProps) {
  const [copied, setCopied] = useState(false);
  const paymentMethodMeta = paymentMethods.find(
    (method) => method.id === paymentMethod,
  );

  const handleCopyCode = async () => {
    if (!paymentCode) return;

    try {
      await navigator.clipboard.writeText(paymentCode);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <h3 className="mb-8 text-xl font-bold uppercase tracking-[0.14em] text-[var(--cf-primary)]">
        Chi tiết thanh toán
      </h3>

      <div className="mb-8 rounded-[2rem] border border-[rgba(176,137,104,0.18)] bg-[var(--cf-bg)] p-8">
        <div className="mb-8 flex flex-col items-center border-b border-[rgba(176,137,104,0.18)] pb-8 text-center">
          <span className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--cf-secondary)]">
            Tổng tiền thanh toán
          </span>
          <div className="text-4xl font-extrabold tracking-tight text-[var(--cf-primary)] md:text-5xl">
            {formattedTotal}
          </div>
          <p className="mt-2 text-xs text-[var(--cf-dark)]">
            (Đã bao gồm VAT & phí dịch vụ)
          </p>
        </div>

        <div className="space-y-6">
          <PaymentDetailRow
            label="Mã giao dịch"
            value={
              <div className="flex items-center justify-end gap-2 rounded-full border border-[rgba(176,137,104,0.2)] bg-white px-4 py-1.5 shadow-sm">
                <span className="font-mono text-sm font-bold text-[var(--cf-primary)]">
                  {paymentCode || "Đang cập nhật"}
                </span>
                <button
                  className="text-[var(--cf-secondary)] transition-colors hover:text-[var(--cf-primary)]"
                  onClick={handleCopyCode}
                  type="button"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            }
          />

          <PaymentDetailRow
            label="Phương thức"
            value={
              <div className="flex items-center justify-end gap-3">
                {paymentMethodMeta ? (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${paymentMethodMeta.iconClassName}`}
                  >
                    {paymentMethodMeta.icon}
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <CreditCard className="h-4 w-4 text-[var(--cf-primary)]" />
                  </div>
                )}

                <span className="font-bold text-[var(--cf-primary)]">
                  {paymentMethodMeta?.label ||
                    paymentMethod ||
                    "Chưa cập nhật"}
                </span>
              </div>
            }
          />

          <PaymentDetailRow
            label="Thời gian"
            value={
              <div className="inline-flex items-center gap-2 font-bold text-[var(--cf-primary)]">
                <Clock3 className="h-4 w-4 text-[var(--cf-secondary)]" />
                <span>{paidAt || "Chưa cập nhật"}</span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

export function ActionButtons({
  onGoHome,
  onCancel,
}: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      <button
        className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--cf-primary)] px-8 py-5 font-bold text-white shadow-[0_18px_36px_rgba(127,85,57,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        onClick={onGoHome}
        type="button"
      >
        <span>Quay lại trang chủ</span>
        <Home className="h-5 w-5" />
      </button>

      <button
        className="w-full rounded-full border border-[rgba(176,137,104,0.2)] py-4 font-semibold text-[var(--cf-dark)] transition-colors hover:bg-[var(--cf-primary)]/5"
        onClick={onCancel}
        type="button"
      >
        Hủy đơn hàng
      </button>
    </div>
  );
}
