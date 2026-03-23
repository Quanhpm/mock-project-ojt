import { Loader2, Trash2, X } from "lucide-react";

interface PosCancelCartModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PosCancelCartModal = ({
  open,
  isSubmitting = false,
  onClose,
  onConfirm,
}: PosCancelCartModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={isSubmitting ? undefined : onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
        >
          <X size={20} />
        </button>

        <div className="border-b border-gray-100 px-6 pb-5 pt-6 sm:px-7">
          <div className="flex items-start gap-4 pr-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-600">
                XÁC NHẬN XÓA GIỎ
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                Xóa giỏ hàng hiện tại?
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Giỏ hàng này sẽ bị hủy và không thể tiếp tục checkout. Bạn vẫn có thể tạo đơn mới ngay sau đó.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-5 sm:px-7">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 rounded-2xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            >
              Giữ lại giỏ hàng
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex h-11 min-w-[170px] items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-900/10 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={17} className="animate-spin" />
                  Đang xóa
                </span>
              ) : (
                "Xóa giỏ hàng"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosCancelCartModal;
