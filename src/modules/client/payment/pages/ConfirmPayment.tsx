import { formatDateTime } from "@/utils";
import { ConfirmRefundModal } from "../component/ConfirmRefundModal"
import { RefundSuccessPopup } from "../component/RefundSuccessPopup";
import { usePaymentSuccess } from "../hooks/usePaymentSuccess";
import { formatCurrencyShort } from "@/utils";

export default function PaymentSuccess() {
    const {
        paymentData, userInfo, franchiseName,
        showModal, setShowModal,
        showSuccessPopup, setShowSuccessPopup,
        onConfirmRefund, goToMenu,
    } = usePaymentSuccess();

    return (
        <>
            <div className="flex flex-col items-center justify-center bg-[var(--cf-bg)] px-4 py-10">
                <div className="w-full max-w-[430px] rounded-[30px] bg-[var(--cf-surface)] px-7 py-8 shadow-[0_18px_40px_rgba(127,85,57,0.12)] lg:max-w-[980px] lg:px-10 lg:py-10">
                    <div className="lg:flex lg:items-stretch lg:gap-10">
                        {/* Left side */}
                        <div className="lg:flex lg:w-[48%] lg:flex-col lg:justify-center">
                            {/* Checkmark */}
                            <div className="mb-5 flex justify-center lg:mb-6">
                                <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[var(--cf-primary)] shadow-[0_8px_18px_rgba(127,85,57,0.25)] lg:h-[72px] lg:w-[72px]">
                                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white lg:h-[34px] lg:w-[34px]">
                                        <svg
                                            className="h-4 w-4 lg:h-5 lg:w-5"
                                            viewBox="0 0 32 32"
                                            fill="none"
                                        >
                                            <path
                                                d="M9 16.5L14 21.5L23 11.5"
                                                stroke="var(--cf-primary)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Heading */}
                            <div className="mb-7 text-center lg:mb-8">
                                <h1 className="text-[20px] font-bold text-[var(--cf-primary)] lg:text-[28px]">
                                    Đơn xác nhận
                                </h1>
                            </div>

                            {/* Customer info */}
                            <div className="mb-7 rounded-[28px] bg-[var(--cf-bg)] px-6 py-6 lg:mb-0 lg:px-7 lg:py-7">
                                <div className="grid grid-cols-[110px_1fr] gap-y-5 text-[15px] leading-relaxed lg:grid-cols-[130px_1fr] lg:gap-y-6 lg:text-[16px]">
                                    <p className="text-[var(--cf-primary)]/80">Khách hàng</p>
                                    <p className="text-right font-semibold text-[var(--cf-primary)]">
                                        {userInfo?.name}
                                    </p>

                                    <p className="text-[var(--cf-primary)]/80">Số điện thoại</p>
                                    <p className="text-right font-semibold text-[var(--cf-primary)]">
                                        {userInfo?.phone}
                                    </p>

                                    <p className="text-[var(--cf-primary)]/80">Đặt từ</p>
                                    <p className="text-right font-semibold text-[var(--cf-primary)]">
                                        {franchiseName}
                                    </p>

                                    <p className="text-[var(--cf-primary)]/80">Giao đến</p>
                                    <p className="text-right font-semibold leading-snug text-[var(--cf-primary)]">
                                        {userInfo?.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-8 lg:mb-0 lg:flex lg:w-[40px] lg:shrink-0 lg:items-center lg:justify-center">
                            {/* Mobile divider ngang */}
                            <div className="border-t border-[var(--cf-secondary)]/40 lg:hidden" />
                            <div className="absolute -left-9 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[var(--cf-bg)] lg:hidden" />
                            <div className="absolute -right-9 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[var(--cf-bg)] lg:hidden" />

                            {/* Laptop divider dọc */}
                            <div className="hidden h-full min-h-[420px] border-l border-[var(--cf-secondary)]/40 lg:block" />
                            <div className="absolute left-1/2 top-0 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-[var(--cf-bg)] lg:block" />
                            <div className="absolute bottom-0 left-1/2 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-[var(--cf-bg)] lg:block" />
                        </div>

                        {/* Right side */}
                        <div className="lg:flex lg:w-[52%] lg:flex-col lg:justify-center">
                            {/* Payment info */}
                            <div className="mb-9 lg:mb-10">
                                <div className="mb-8 flex items-end justify-between lg:mb-10">
                                    <span className="text-[16px] font-semibold text-[var(--cf-primary)] lg:text-[20px]">
                                        Tổng tiền
                                    </span>
                                    <span className="text-[22px] font-bold text-[var(--cf-primary)] lg:text-[32px]">
                                        {formatCurrencyShort(paymentData?.amount ?? 0)}
                                    </span>
                                </div>

                                <div className="space-y-5 lg:space-y-6">
                                    <div className="grid grid-cols-[120px_1fr] items-center lg:grid-cols-[140px_1fr]">
                                        <p className="text-[13px] uppercase tracking-wide text-[var(--cf-dark)]/80 lg:text-[14px]">
                                            Mã giao dịch
                                        </p>
                                        <p className="text-right text-[15px] font-semibold text-[var(--cf-primary)] lg:text-[17px]">
                                            {paymentData?.code}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr] items-center lg:grid-cols-[140px_1fr]">
                                        <p className="text-[13px] uppercase tracking-wide text-[var(--cf-dark)]/80 lg:text-[14px]">
                                            Phương thức
                                        </p>
                                        <p className="text-right text-[15px] font-semibold text-[var(--cf-primary)] lg:text-[17px]">
                                            {paymentData?.method}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr] items-center lg:grid-cols-[140px_1fr]">
                                        <p className="text-[13px] uppercase tracking-wide text-[var(--cf-dark)]/80 lg:text-[14px]">
                                            Thời gian
                                        </p>
                                        <p className="text-right text-[15px] font-semibold text-[var(--cf-primary)] lg:text-[17px]">
                                            {formatDateTime(paymentData?.paid_at ?? "")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-4 lg:mt-auto">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="rounded-full bg-[var(--cf-primary)] py-4 text-base font-semibold text-[var(--cf-bg)] shadow-[0_8px_18px_rgba(127,85,57,0.22)] transition-all duration-200 hover:translate-y-[-1px] hover:opacity-95 lg:py-4 lg:text-[17px]"
                                >
                                    Tôi muốn hủy đơn
                                </button>

                                <button
                                    onClick={goToMenu}
                                    className="rounded-full border border-[var(--cf-secondary)] bg-transparent py-4 text-base font-semibold text-[var(--cf-primary)] transition-colors duration-200 hover:bg-[var(--cf-accent-light)]/35 lg:py-4 lg:text-[17px]"
                                >
                                    Quay lại trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <ConfirmRefundModal
                    onClose={() => setShowModal(false)}
                    onConfirm={onConfirmRefund}
                />
            )}

            {showSuccessPopup && (
                <RefundSuccessPopup
                    onClose={() => setShowSuccessPopup(false)}
                />
            )}
        </>
    );
}