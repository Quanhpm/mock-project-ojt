import { useNavigate } from "react-router-dom";

interface RefundSuccessPopupProps {
    onClose: () => void;
}

export function RefundSuccessPopup({ onClose }: RefundSuccessPopupProps) {
    const navigate = useNavigate();
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-[28px] bg-[var(--cf-surface)] px-6 py-8 text-center shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cf-primary)] shadow-[0_8px_18px_rgba(127,85,57,0.25)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                        <svg className="h-5 w-5 text-[var(--cf-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-[var(--cf-primary)]">
                    Hoàn tiền thành công
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-[var(--cf-dark)]">
                    Yêu cầu hoàn tiền của bạn đã được ghi nhận thành công.
                </p>

                <button
                    onClick={() => navigate("/menu")}
                    className="w-full rounded-full bg-[var(--cf-primary)] py-3 text-sm font-semibold text-white"
                >
                    Về trang chủ
                </button>
            </div>
        </div>
    );
}