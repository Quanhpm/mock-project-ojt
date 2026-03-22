import { ChevronRight, ShoppingBag } from 'lucide-react';
import type { CartSummaryView } from '../hooks/cartApiMapper';

interface CartSummaryCardProps {
  cart: CartSummaryView;
  onOpenDetail: (cartId: string) => void;
  formatUpdatedAt: (value: string) => string;
}

function CartSummaryCard({ cart, onOpenDetail, formatUpdatedAt }: CartSummaryCardProps) {
  const badgeClassName = cart.status === 'ACTIVE'
    ? 'bg-[var(--cf-secondary)]/15 text-[var(--cf-secondary)]'
    : 'bg-[var(--cf-primary)]/10 text-[var(--cf-primary)]/70';

  return (
    <article
      className="group bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(28,27,27,0.03)] hover:shadow-[0px_20px_40px_rgba(28,27,27,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full border border-[var(--cf-primary)]/10"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[var(--cf-bg)] flex items-center justify-center shrink-0">
            <ShoppingBag size={20} className="text-[var(--cf-primary)]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[var(--cf-dark)] leading-tight truncate">{cart.franchiseName}</h3>
            <p className="text-xs text-[var(--cf-primary)]/70 truncate">{formatUpdatedAt(cart.createdAt)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full ${badgeClassName}`}>
          {cart.status === 'ACTIVE' ? 'Đang chọn' : cart.status}
        </span>
      </div>

      <div className="space-y-3 mb-8 flex-grow">
        {cart.itemsPreview.length > 0 ? cart.itemsPreview.map((item) => (
          <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-[var(--cf-bg)] transition-colors" key={`${cart.id}-${item.id || item.name}`}>
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--cf-bg)] shrink-0">
              {item.imageUrl ? (
                <img alt={item.name} className="w-full h-full object-cover" src={item.imageUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--cf-primary)]/40">
                  <ShoppingBag size={16} />
                </div>
              )}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-[var(--cf-dark)] truncate">{item.name}</p>
              <p className="text-xs text-[var(--cf-primary)]/70 truncate">
                {item.optionSummary || 'Không có topping tùy chọn'}
              </p>
            </div>
            <span className="text-sm font-bold text-[var(--cf-primary)]/70">x{item.quantity}</span>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-[var(--cf-primary)]/20 p-4 text-sm text-[var(--cf-primary)]/60">
            Chưa có sản phẩm trong giỏ hàng này.
          </div>
        )}

        {cart.itemsCount > cart.itemsPreview.length && (
          <div className="flex justify-center pt-1">
            <span className="text-xs font-bold text-[var(--cf-primary)] px-3 py-1 bg-[var(--cf-primary)]/10 rounded-full">
              +{cart.itemsCount - cart.itemsPreview.length} sản phẩm khác
            </span>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-[var(--cf-primary)]/10">
        <div className="flex justify-between items-end mb-5">
          <span className="text-sm text-[var(--cf-primary)]/70 font-medium">{cart.itemsCount} sản phẩm</span>
          <span className="text-xl font-black text-[var(--cf-primary)] tracking-tight">{cart.totalAmount.toLocaleString('vi-VN')} đ</span>
        </div>

        <button
          className="w-full bg-[var(--cf-primary)] text-white py-3.5 rounded-xl font-bold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => onOpenDetail(cart.id)}
          type="button"
        >
          Xem chi tiết
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

export default CartSummaryCard;

