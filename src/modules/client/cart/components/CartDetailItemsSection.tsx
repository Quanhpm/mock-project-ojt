import { ArrowLeft } from 'lucide-react';
import type { CartDetailItemView } from '../hooks/cartApiMapper';
import CartDetailItemCard from './CartDetailItemCard';

interface CartDetailItemsSectionProps {
  items: CartDetailItemView[];
  isDeleting: string | null;
  isUpdatingQuantity: string | null;
  pendingQuantityChanges: Record<string, number>;
  isSavingQuantityChanges: boolean;
  onDelete: (itemId: string) => void;
  onEdit: (item: CartDetailItemView) => void;
  onDecreaseQty: (itemId: string) => void;
  onIncreaseQty: (itemId: string) => void;
  onSubmitQty: (itemId: string, nextQty: number) => void;
  onSaveQuantityChanges: () => Promise<boolean>;
  onContinueShopping: () => void;
  formatCurrency: (amount: number) => string;
}

function CartDetailItemsSection({
  items,
  isDeleting,
  isUpdatingQuantity,
  pendingQuantityChanges,
  isSavingQuantityChanges,
  onDelete,
  onEdit,
  onDecreaseQty,
  onIncreaseQty,
  onSubmitQty,
  onSaveQuantityChanges,
  onContinueShopping,
  formatCurrency,
}: CartDetailItemsSectionProps) {
  return (
    <section className="min-w-0 flex-1">
      <div className="mb-4 rounded-[28px] border border-[var(--cf-primary)]/10 bg-white/75 px-4 py-4 shadow-[0px_14px_30px_rgba(28,27,27,0.04)] md:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cf-primary)]/50">
          Danh sách món
        </p>
        <p className="mt-1 text-lg font-bold text-[var(--cf-dark)]">
          {items.length} món đang có trong giỏ
        </p>
      </div>

      <div className="mb-5 hidden grid-cols-12 gap-4 px-6 text-xs font-bold uppercase tracking-[0.16em] text-[var(--cf-primary)]/55 md:grid">
        <div className="col-span-5">Sản phẩm</div>
        <div className="col-span-2 text-center">Đơn giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-2 pr-4 text-right">Tổng cộng</div>
        <div className="col-span-1" />
      </div>

      <div className="space-y-4 md:space-y-5">
        {items.map((item) => (
          <CartDetailItemCard
            formatCurrency={formatCurrency}
            hasPendingQuantityChange={pendingQuantityChanges[item.id] !== undefined}
            isDeleting={isDeleting === item.id}
            isSavingQuantityChanges={isSavingQuantityChanges}
            isUpdatingQuantity={isUpdatingQuantity === item.id}
            item={item}
            key={item.id}
            onDecreaseQty={onDecreaseQty}
            onDelete={onDelete}
            onEdit={onEdit}
            onIncreaseQty={onIncreaseQty}
            onSaveQuantityChanges={onSaveQuantityChanges}
            onSubmitQty={onSubmitQty}
          />
        ))}
      </div>

      <div className="mt-6 md:mt-8">
        <button
          onClick={onContinueShopping}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--cf-primary)]/15 bg-white px-4 py-3 text-sm font-semibold text-[var(--cf-primary)] transition-colors hover:border-[var(--cf-primary)]/25 hover:text-[var(--cf-dark)] cursor-pointer md:w-auto md:justify-start md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0"
          type="button"
        >
          <ArrowLeft size={16} />
          Tiếp tục mua sắm
        </button>
      </div>
    </section>
  );
}

export default CartDetailItemsSection;
