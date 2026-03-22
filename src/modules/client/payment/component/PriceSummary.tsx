import { formatCurrencyShort } from "@/utils"
import type { OrderResponse } from "@/apis/endpointsCLIENT/payment.api";

interface DiscountProps {
    label: string;
    value: number;
}

function Discount({ label, value }: DiscountProps) {
    if (value === 0) return null;
    return (
        <div className="flex justify-between text-sm">
            <span className="font-medium text-[#4A7C59]">{label}</span>
            <span className="font-semibold text-[#4A7C59]">− {formatCurrencyShort(value)}</span>
        </div>
    )
}

interface PriceSummaryProps {
    orderData?: OrderResponse | null;
}

export function PriceSummary({ orderData }: PriceSummaryProps) {
    return (
        <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
                Chi tiết thanh toán
            </p>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm text-[var(--cf-secondary)]">
                    <span>Giá gốc</span>
                    <span>{formatCurrencyShort(orderData?.subtotal_amount ?? 0)}</span>
                </div>

                <Discount
                    label="Giảm giá từ promotion"
                    value={orderData?.promotion_discount ?? 0}
                />
                <Discount
                    label="Giảm giá từ voucher"
                    value={orderData?.voucher_discount ?? 0}
                />
                <Discount
                    label="Giảm giá từ điểm thành viên"
                    value={orderData?.loyalty_discount ?? 0}
                />

                <div className="my-1 h-px bg-[var(--cf-accent-light)]" />

                <div className="flex justify-between">
                    <span className="text-base font-bold text-[var(--cf-primary)]">Tổng cộng</span>
                    <span className="text-base font-extrabold text-[var(--cf-dark)]">
                        {formatCurrencyShort(orderData?.final_amount ?? 0)}
                    </span>
                </div>
            </div>
        </div>
    )
}