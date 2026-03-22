import { ArrowLeft } from 'lucide-react';
import type { CartDetailItemView } from '../hooks/cartApiMapper';
import CartDetailItemCard from './CartDetailItemCard';

interface CartDetailItemsSectionProps {
  items: CartDetailItemView[];
  isDeleting: string | null;
  isUpdatingQuantity: string | null;
  onDelete: (itemId: string) => void;
  onEdit: (item: CartDetailItemView) => void;
  onDecreaseQty: (itemId: string) => void;
  onIncreaseQty: (itemId: string) => void;
  onSubmitQty: (itemId: string, nextQty: number) => void;
  onContinueShopping: () => void;
  formatCurrency: (amount: number) => string;
}

function CartDetailItemsSection({
  items,
  isDeleting,
  isUpdatingQuantity,
  onDelete,
  onEdit,
  onDecreaseQty,
  onIncreaseQty,
  onSubmitQty,
  onContinueShopping,
  formatCurrency,
}: CartDetailItemsSectionProps) {
  return (
    <section className="flex-1">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 mb-5 text-xs font-bold text-[var(--cf-primary)]/55 uppercase tracking-[0.16em]">
        <div className="col-span-5">Sản phẩm</div>
        <div className="col-span-2 text-center">Đơn giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-2 text-right pr-4">Tổng cộng</div>
        <div className="col-span-1" />
      </div>

      <div className="space-y-5">
        {items.map((item) => {
          return (
            <CartDetailItemCard
              formatCurrency={formatCurrency}
              isDeleting={isDeleting === item.id}
              isUpdatingQuantity={isUpdatingQuantity === item.id}
              item={item}
              key={item.id}
              onDecreaseQty={onDecreaseQty}
              onDelete={onDelete}
              onEdit={onEdit}
              onIncreaseQty={onIncreaseQty}
              onSubmitQty={onSubmitQty}
            />
          );
        })}
      </div>

      <div className="mt-8">
        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cf-primary)] hover:text-[var(--cf-dark)] transition-colors cursor-pointer"
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

