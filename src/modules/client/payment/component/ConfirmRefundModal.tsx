import { useState } from "react"

interface ConfirmModalProps {
    onClose: () => void;
    onConfirm: (message: string) => void;
}

export function ConfirmRefundModal({ onClose, onConfirm }: ConfirmModalProps) {
    const [message, setMessage] = useState("");

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Modal panel */}
            <div className="w-full max-w-sm rounded-t-[24px] bg-[var(--cf-surface)] px-6 pb-8 pt-6 sm:rounded-[20px] animate-[slideUp_0.22s_ease-out]">

                {/* Drag handle (mobile) */}
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--cf-secondary)] opacity-50 sm:hidden" />

                {/* Icon + Title */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cf-accent-light)]">
                        <svg className="h-5 w-5 text-[var(--cf-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--cf-primary)]">
                        Xác nhận hoàn tiền
                    </h3>
                </div>

                {/* Description */}
                <p className="mb-3 text-[13px] leading-relaxed text-[var(--cf-dark)]">
                    Bạn có chắc chắn muốn hoàn tiền? Nếu có, hãy cho chúng tôi biết lý do:
                </p>

                {/* Reason input */}
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập lý do hoàn tiền..."
                    rows={3}
                    className="w-full resize-none rounded-[12px] border border-[var(--cf-secondary)] bg-[var(--cf-bg)] px-4 py-3 text-[13px] text-[var(--cf-primary)] placeholder:text-[var(--cf-secondary)] outline-none transition-colors focus:border-[var(--cf-primary)] focus:ring-1 focus:ring-[var(--cf-primary)]"
                />

                {/* Actions */}
                <div className="mt-4 flex gap-2.5">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-[14px] border border-[var(--cf-secondary)] bg-transparent py-3 text-sm font-medium text-[var(--cf-primary)] transition-colors hover:bg-[var(--cf-accent-light)] active:scale-[0.98]"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onConfirm(message)}
                        disabled={!message.trim()}
                        className="flex-1 rounded-[14px] bg-[var(--cf-primary)] py-3 text-sm font-medium text-[var(--cf-bg)] opacity-90 transition-all hover:opacity-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}