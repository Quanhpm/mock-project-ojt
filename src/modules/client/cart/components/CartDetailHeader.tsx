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
    <div className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--cf-primary)]/70 hover:text-[var(--cf-primary)] transition-colors cursor-pointer"
          type="button"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách
        </button>

        <div className="space-y-2">
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--cf-primary)]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--cf-primary)]/70">
            {itemCount} sản phẩm
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--cf-dark)] md:text-4xl">
            Giỏ hàng của bạn
          </h1>
        </div>
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed md:w-auto md:rounded-lg md:py-2"
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
