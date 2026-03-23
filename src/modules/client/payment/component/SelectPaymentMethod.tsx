import { Landmark, Wallet } from "lucide-react";
import type { PaymentMethod } from "./payment-methods";
import { paymentMethods } from "./payment-methods";

interface PaymentItemProps {
  isSelected: boolean;
  method: PaymentMethod;
  onSelect: (methodId: string) => void;
}

interface SelectPaymentMethodProps {
  selectedPayment: string;
  onSelect: (methodId: string) => void;
}

function PaymentMethodItem({
  isSelected,
  method,
  onSelect,
}: PaymentItemProps) {
  return (
    <button
      className={`rounded-[16px] border px-3 py-2.5 text-left transition-all duration-200 ${
        isSelected
          ? "border-[var(--cf-primary)] bg-[var(--cf-primary)] text-white shadow-[0_12px_24px_rgba(127,85,57,0.14)]"
          : "border-[var(--cf-primary)]/10 bg-[var(--cf-bg)]/72 text-[var(--cf-primary)] hover:bg-white"
      }`}
      onClick={() => onSelect(method.id)}
      type="button"
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isSelected ? "bg-white/16 text-white" : method.iconClassName
          }`}
        >
          {method.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-sm font-bold">{method.label}</p>
              {method.id === "VNPAY" && (
                <Landmark
                  className={`h-3.5 w-3.5 ${
                    isSelected ? "text-white/80" : "text-[var(--cf-secondary)]"
                  }`}
                />
              )}
              {method.id === "MOMO" && (
                <Wallet
                  className={`h-3.5 w-3.5 ${
                    isSelected ? "text-white/80" : "text-[var(--cf-secondary)]"
                  }`}
                />
              )}
            </div>

            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                isSelected
                  ? "border-white/30 bg-white text-[var(--cf-primary)]"
                  : "border-[var(--cf-primary)]/10 bg-white text-transparent"
              }`}
            >
              ✓
            </span>
          </div>

          <p
            className={`mt-0.5 text-[11px] leading-[1.15rem] ${
              isSelected ? "text-white/80" : "text-[var(--cf-secondary)]"
            }`}
          >
            {method.description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function SelectPaymentMethod({
  selectedPayment,
  onSelect,
}: SelectPaymentMethodProps) {
  return (
    <section className="rounded-[22px] border border-[var(--cf-primary)]/10 bg-white/85 p-3.5 shadow-[0_16px_36px_rgba(127,85,57,0.06)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--cf-secondary)]">
            Phương thức
          </p>
          <h2 className="mt-0.5 text-[15px] font-bold text-[var(--cf-primary)]">
            Chọn thanh toán
          </h2>
        </div>

        <span className="rounded-full border border-[var(--cf-primary)]/10 bg-[var(--cf-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--cf-primary)]">
          {paymentMethods.length} lựa chọn
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-1.5">
        {paymentMethods.map((method) => (
          <PaymentMethodItem
            isSelected={selectedPayment === method.id}
            key={method.id}
            method={method}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
