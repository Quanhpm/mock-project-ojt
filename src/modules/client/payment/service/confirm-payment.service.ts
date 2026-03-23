import { formatCurrency } from "@/utils";

type PaymentTotal = number | string | null | undefined;

export function formatConfirmPaymentTotal(total: PaymentTotal): string {
  if (total === null || total === undefined || total === "") {
    return formatCurrency(0);
  }

  if (typeof total === "number") {
    return Number.isFinite(total) ? formatCurrency(total) : formatCurrency(0);
  }

  // Keep digits/signs only so inputs like "125.000đ" or "125,000 VND" can still be parsed.
  const normalized = total.replace(/[^\d.-]/g, "");
  const amount = Number(normalized);

  return Number.isFinite(amount) ? formatCurrency(amount) : formatCurrency(0);
}