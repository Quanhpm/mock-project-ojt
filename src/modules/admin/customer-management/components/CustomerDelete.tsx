import { X, AlertTriangle } from "lucide-react";

interface CustomerDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  customerId: string;
  isDeleting?: boolean;
}

export default function CustomerDelete({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  customerId,
  isDeleting = false,
}: CustomerDeleteProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isDeleting) return;
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-[480px] rounded-xl bg-white p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex items-center justify-center rounded-md p-2 text-gray-500 transition-colors hover:text-gray-900"
        >
          <X size={20} />
        </button>

        {/* Warning Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex items-center justify-center rounded-full bg-amber-50 p-3">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-gray-900">
          Xóa khách hàng
        </h2>

        {/* Description */}
        <p className="mb-4 text-center text-sm text-gray-500">
          Bạn có chắc chắn muốn xóa{" "}
          <strong>{customerName}</strong> (ID: {customerId})? Hành động này không
          thể hoàn tác.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-lg border-0 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:opacity-70"
          >
            {isDeleting ? "Đang xóa..." : "Xóa khách hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
