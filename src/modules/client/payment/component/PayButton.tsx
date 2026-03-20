interface PayButtonProps {
    paying: boolean;
    onConfirmPayment: () => void;
}

export function PayButton({ paying, onConfirmPayment}: PayButtonProps) {

    return (
        <button
            onClick={onConfirmPayment}
            disabled={paying}
            className={`w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition-all duration-300 ${paying ? "bg-[#4A7C59] opacity-90" : "bg-[var(--cf-primary)] opacity-100"
              }`}
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              `Thanh toán`
            )}
          </button>
    )
}