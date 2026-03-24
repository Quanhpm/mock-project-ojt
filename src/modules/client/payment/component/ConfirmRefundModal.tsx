import { useEffect, useId, useState } from "react";

export interface ConfirmRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
}

export function ConfirmRefundModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmRefundModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaId = useId();
  const trimmedMessage = message.trim();

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setIsSubmitting(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleConfirm = async () => {
    if (!trimmedMessage || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(onConfirm(trimmedMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby={`${textareaId}-title`}
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(74,55,40,0.28)] backdrop-blur-sm md:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className="relative w-full transform overflow-hidden rounded-t-xl border border-[rgba(176,137,104,0.16)] bg-white shadow-[0_24px_60px_rgba(127,85,57,0.18)] transition-all duration-300 md:max-w-[480px] md:rounded-xl">
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1.5 w-10 rounded-full bg-[var(--cf-secondary)]/25" />
        </div>

        <div className="px-6 pb-10 pt-4 md:px-8 md:py-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cf-accent-light)]/55 shadow-[0_12px_26px_rgba(127,85,57,0.1)]">
              <span className="material-symbols-outlined text-3xl text-[var(--cf-primary)]">
                replay
              </span>
            </div>
            <h2
              className="mb-2 text-xl font-bold tracking-tight text-[var(--cf-primary)] md:text-2xl"
              id={`${textareaId}-title`}
            >
              Xác nhận hoàn tiền
            </h2>
            <p className="text-sm font-medium leading-relaxed text-[var(--cf-dark)] md:text-base">
              Hành động này sẽ hoàn tiền cho đơn hàng
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-[var(--cf-bg)] p-4">
              <p className="text-sm leading-6 text-[var(--cf-dark)] md:text-[14px]">
                Bạn có chắc chắn muốn hoàn tiền? Hãy nhập lý do để tiếp tục.
                Quy trình này không thể hoàn tác sau khi đã thực hiện.
              </p>
            </div>

            <div className="space-y-2">
              <label
                className="ml-1 block text-xs font-bold uppercase tracking-wider text-[var(--cf-dark)]"
                htmlFor={textareaId}
              >
                Lý do hoàn tiền
              </label>
              <textarea
                className="w-full resize-none rounded-2xl bg-white p-4 text-sm text-[var(--cf-primary)] outline-none ring-1 ring-[var(--cf-secondary)]/35 transition-all placeholder:text-[var(--cf-secondary)]/85 focus:ring-2 focus:ring-[var(--cf-primary)] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[var(--cf-secondary)]/45 [&::-webkit-scrollbar-track]:bg-transparent md:text-[14px]"
                disabled={isSubmitting}
                id={textareaId}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Nhập lý do hoàn tiền..."
                rows={4}
                value={message}
              />
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 md:flex-row">
            <button
              className="order-2 flex-1 rounded-full border border-[var(--cf-secondary)]/20 bg-[var(--cf-bg)] px-6 py-4 font-bold text-[var(--cf-primary)] transition-all duration-200 hover:bg-[var(--cf-accent-light)]/30 active:scale-95 md:order-1"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Hủy
            </button>
            <button
              className="order-1 flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--cf-primary)] px-6 py-4 font-bold text-white shadow-[0_16px_32px_rgba(127,85,57,0.2)] transition-all duration-200 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:order-2"
              disabled={!trimmedMessage || isSubmitting}
              onClick={handleConfirm}
              type="button"
            >
              <span>Xác nhận hoàn tiền</span>
            </button>
          </div>

          <button
            aria-label="Đóng"
            className="absolute top-6 right-6 hidden text-[var(--cf-secondary)] transition-colors hover:text-[var(--cf-primary)] md:flex"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
