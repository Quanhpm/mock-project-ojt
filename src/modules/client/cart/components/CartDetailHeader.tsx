import { ArrowLeft, Trash2 } from 'lucide-react';

interface CartDetailHeaderProps {
  itemCount: number;
  isCancellingCart: boolean;
  onBack: () => void;
  onOpenCancelCartConfirm: () => void;
}

function CartDetailHeader({
  itemCount,
  isCancellingCart,
  onBack,
  onOpenCancelCartConfirm,
}: CartDetailHeaderProps) {
  return (
    <div className="mb-10 flex items-end justify-between">
      <div>
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--cf-primary)]/70 hover:text-[var(--cf-primary)] transition-colors cursor-pointer"
          type="button"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách
        </button>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--cf-dark)]">
          Giỏ hàng của bạn
          <span className="ml-3 text-xl md:text-2xl font-semibold text-[var(--cf-primary)]/45">({itemCount} sản phẩm)</span>
        </h1>
      </div>

      <button
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold border border-red-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onOpenCancelCartConfirm}
        disabled={isCancellingCart}
        type="button"
      >
        <Trash2 size={16} />
        {isCancellingCart ? 'Đang xóa giỏ hàng...' : 'Xóa giỏ hàng'}
      </button>
    </div>
  );
}

export default CartDetailHeader;
