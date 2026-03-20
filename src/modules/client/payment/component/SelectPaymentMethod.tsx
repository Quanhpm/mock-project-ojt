import type { ReactNode } from "react"

export type PaymentMethod = {
    id: string;
    label: string;
    icon: ReactNode;
};

interface PaymentItemProps {
    isSelected: boolean;
    method: PaymentMethod;
    onSelect: (methodId: string) => void;
}

interface SelectPaymentMethodProps {
    selectedPayment: string;
    onSelect: (methodId: string) => void;
}

export const paymentMethods = [
    {
        id: "CASH",
        label: "Tiền mặt",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a4 4 0 00-8 0v2M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    {
        id: "MOMO",
        label: "Ví MoMo",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: "CARD",
        label: "Thẻ",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: "VNPAY",
        label: "VNPay",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

function PaymentMethodItem({ isSelected, method, onSelect }: PaymentItemProps ) {
    return (
        <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-all duration-200 ${isSelected
                ? "border-[var(--cf-primary)] bg-[var(--cf-primary)] text-white"
                : "border-[var(--cf-accent-light)] bg-[var(--cf-bg)] text-[var(--cf-primary)]"
                }`}
        >
            <span className="flex-shrink-0">{method.icon}</span>
            <span className="text-sm font-semibold leading-tight">{method.label}</span>

            {isSelected && (
                <span className="ml-auto flex-shrink-0">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            )}
        </button>
    );
}

export function SelectPaymentMethod({ selectedPayment, onSelect }: SelectPaymentMethodProps) {
    return (
        <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
                Phương thức thanh toán
            </p>

            <div className="grid grid-cols-1 gap-2">
                {paymentMethods.map((method) => {
                    const isSelected = selectedPayment === method.id;
                    return (
                        <PaymentMethodItem 
                            isSelected={isSelected}
                            method={method}
                            onSelect={onSelect}
                        />
                    );
                })}
            </div>
        </div>
    )
}