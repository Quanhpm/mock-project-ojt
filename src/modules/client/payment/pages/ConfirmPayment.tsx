import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react"
import { usePaymentRefund } from "../hooks/usePaymentRefund";

export default function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleRefund } = usePaymentRefund();
    const [showModal, setShowModal] = useState(false);
    const state = location.state as { total?: string; paymentId?: string } | null;
    const total: string = state?.total ?? "";
    const paymentId: string = state?.paymentId ?? "";

    return (
        <>
            <div className="flex min-h-screen items-center justify-center bg-[var(--cf-bg)] p-4">
                <div className="w-full max-w-sm rounded-[20px] border border-[var(--cf-secondary)] bg-[var(--cf-surface)] px-8 py-8 flex flex-col items-center">

                    {/* Label */}
                    <span className="mb-6 text-[11px] font-medium uppercase tracking-widest text-[var(--cf-primary)]">
                        Đơn xác nhận
                    </span>

                    {/* Checkmark */}
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cf-primary)]">
                        <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
                            <path d="M7 16.5L13.5 23L25 10" stroke="#EDE0D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <p className="text-[17px] font-medium text-[var(--cf-primary)]">Đã thanh toán thành công</p>
                    <p className="mb-6 mt-1 text-[13px] text-[var(--cf-dark)]">Cảm ơn bạn đã đặt hàng!</p>

                    <div className="mb-5 w-full border-t border-[var(--cf-secondary)] opacity-50" />

                    {/* Total */}
                    <div className="mb-7 flex w-full items-baseline justify-between">
                        <span className="text-[13px] text-[var(--cf-dark)]">Tổng tiền</span>
                        <span className="text-[22px] font-medium text-[var(--cf-primary)]">{total}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex w-full flex-col gap-2.5">
                        <button
                            onClick={() => navigate("/menu")}
                            className="rounded-[14px] border-[1.5px] border-[var(--cf-secondary)] bg-transparent py-3 text-sm font-medium text-[var(--cf-primary)] transition-colors hover:bg-[var(--cf-accent-light)]">
                            Trở về
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded-[14px] bg-[var(--cf-primary)] py-3 text-sm font-medium text-[var(--cf-bg)] opacity-90 transition-opacity hover:opacity-100">
                            Hoàn tiền
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <ConfirmRefundModal
                    onClose={() => setShowModal(false)}
                    onConfirm={(message) => {
                        handleRefund({ paymentId, message });
                        setShowModal(false);
                    }}
                />
            )}
        </>
    );
}

interface ConfirmModalProps {
    onClose: () => void;
    onConfirm: (message: string) => void;
}

function ConfirmRefundModal({ onClose, onConfirm }: ConfirmModalProps) {
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