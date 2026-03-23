import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PayButtonProps {
  paying: boolean;
  onConfirmPayment: () => void;
}

export function PayButton({ paying, onConfirmPayment }: PayButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 rounded-2xl bg-white py-4 text-sm font-bold uppercase tracking-widest text-[var(--cf-primary)] shadow-sm transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-2">
            Thoát đơn
          </span>
        </button>

        <button
          onClick={onConfirmPayment}
          disabled={paying}
          className={`flex-1 rounded-2xl py-4 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition-all duration-300 active:scale-[0.98] ${paying
              ? "bg-[#4A7C59] opacity-90"
              : "bg-[var(--cf-primary)] opacity-100 hover:opacity-90"
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
            "Thanh toán"
          )}
        </button>
      </div>

      {showModal && (
        <ConfirmModal
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            navigate("/cart")
          }}
        />
      )}
    </>
  )
}

interface ConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmModal({ onClose, onConfirm }: ConfirmModalProps) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="w-full max-w-sm animate-[fadeSlideUp_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl">

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-semibold text-gray-900">
          Hủy thanh toán
        </h3>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          Nếu thoát ra đơn hàng của bạn sẽ mất và không được thanh toán. Bạn có chắc với hành động này?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 transition-all duration-150 hover:bg-gray-50 active:scale-[0.98]"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-600 active:scale-[0.98]"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}