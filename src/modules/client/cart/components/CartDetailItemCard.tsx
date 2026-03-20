import { Pencil, ShoppingBag, X } from 'lucide-react';
import type { CartDetailItemView } from '../hook/cartApiMapper';

interface CartDetailItemCardProps {
  item: CartDetailItemView;
  isDeleting: boolean;
  onDelete: (itemId: string) => void;
  onEdit: (item: CartDetailItemView) => void;
  formatCurrency: (amount: number) => string;
}

function CartDetailItemCard({
  item,
  isDeleting,
  onDelete,
  onEdit,
  formatCurrency,
}: CartDetailItemCardProps) {
  const optionText = item.options.map((o) => `${o.productName} x${o.quantity}`).join(', ');

  return (
    <article
      className="bg-white p-4 rounded-lg shadow-sm border border-[var(--cf-primary)]/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
      key={item.id}
    >
      <div className="col-span-1 md:col-span-5 flex gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[var(--cf-bg)] flex-shrink-0">
          {item.imageUrl ? (
            <img alt={item.name} className="w-full h-full object-cover" src={item.imageUrl} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--cf-secondary)]">
              <ShoppingBag size={22} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="font-semibold text-[var(--cf-dark)]">{item.name}</h3>
          {optionText && (
            <p className="text-xs text-[var(--cf-primary)]/70 mt-1 italic">Topping: {optionText}</p>
          )}
          {item.note && (
            <p className="text-xs text-[var(--cf-primary)]/70 mt-1 italic">Ghi chú: {item.note}</p>
          )}

          <button
            className="mt-3 text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--cf-primary)]/20 text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isDeleting}
            onClick={() => onEdit(item)}
          >
            <Pencil size={12} />
            Chỉnh sửa món
          </button>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 text-center text-[var(--cf-primary)]/80">
        <span className="md:hidden text-xs text-[var(--cf-primary)]/50 block uppercase">Giá:</span>
        {formatCurrency(item.unitPrice)}
      </div>

      <div className="col-span-1 md:col-span-2 flex justify-center items-center">
        <span className="inline-flex min-w-10 justify-center rounded-full bg-[var(--cf-bg)] border border-[var(--cf-primary)]/20 px-3 py-1.5 text-sm font-semibold text-[var(--cf-dark)]">
          {item.quantity}
        </span>
      </div>

      <div className="col-span-1 md:col-span-2 text-right font-semibold text-[var(--cf-dark)]">
        <span className="md:hidden text-xs text-[var(--cf-primary)]/50 block uppercase">Thành tiền:</span>
        {formatCurrency(item.finalLineTotal)}
      </div>

      <div className="col-span-1 flex justify-end md:justify-center">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--cf-primary)]/40 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={isDeleting}
          onClick={() => onDelete(item.id)}
          title="Xóa khỏi giỏ"
        >
          <X size={16} />
        </button>
      </div>
    </article>
  );
}

export default CartDetailItemCard;
