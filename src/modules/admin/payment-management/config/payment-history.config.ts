import type { PaymentHistoryStatus } from "../models/payment-history.models";

export const PAYMENT_HISTORY_STATUS_OPTIONS: Array<{
  label: string;
  value: PaymentHistoryStatus | "";
}> = [
  { label: "Tất cả", value: "" },
  { label: "PENDING", value: "PENDING" },
  { label: "PAID", value: "PAID" },
  { label: "REFUNDED", value: "REFUNDED" },
];

export const PAYMENT_HISTORY_STATUS_LABELS: Record<PaymentHistoryStatus, string> = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
};

export const PAYMENT_HISTORY_STATUS_BADGES: Record<PaymentHistoryStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REFUNDED: "bg-slate-100 text-slate-700 ring-slate-200",
};
