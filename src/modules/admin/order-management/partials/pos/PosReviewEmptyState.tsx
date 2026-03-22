import { ArrowLeft } from "lucide-react";

interface PosReviewEmptyStateProps {
  onBack: () => void;
}

export const PosReviewEmptyState = ({ onBack }: PosReviewEmptyStateProps) => {
  return (
    <main className="flex h-[calc(100vh-48px)] w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-[#f9f9f9] p-8 shadow-sm">
      <p className="mb-4 text-xl font-bold text-gray-900">Không tìm thấy đơn hàng để kiểm tra</p>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 font-bold text-white transition hover:bg-amber-900"
      >
        <ArrowLeft size={20} />
        Quay lại chọn món
      </button>
    </main>
  );
};
