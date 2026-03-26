import { ArrowLeft } from "lucide-react";

interface PosReviewEmptyStateProps {
  onBack: () => void;
}

export const PosReviewEmptyState = ({ onBack }: PosReviewEmptyStateProps) => {
  return (
    <main className="flex min-h-[calc(100dvh-48px)] w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-[#f9f9f9] p-6 shadow-sm sm:p-8 lg:h-[calc(100dvh-48px)]">
      <p className="mb-4 text-center text-lg font-bold text-gray-900 sm:text-xl">
        Không tìm thấy đơn hàng để kiểm tra
      </p>
      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-6 py-3 font-bold text-white transition hover:bg-amber-900 sm:w-auto"
      >
        <ArrowLeft size={20} />
        Quay lại chọn món
      </button>
    </main>
  );
};
