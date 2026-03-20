import { ChevronRight, ShoppingBag } from 'lucide-react';
import type { CartSummaryView } from '../hook/cartApiMapper';

interface CartSummaryCardProps {
  cart: CartSummaryView;
  onOpenDetail: (cartId: string) => void;
  formatUpdatedAt: (value: string) => string;
}

function CartSummaryCard({ cart, onOpenDetail, formatUpdatedAt }: CartSummaryCardProps) {
  return (
    <button
      key={cart.id}
      onClick={() => onOpenDetail(cart.id)}
      className="w-full text-left bg-white rounded-lg p-5 border border-[var(--cf-primary)]/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-[var(--cf-bg)] rounded-lg text-[var(--cf-primary)]">
          <ShoppingBag size={22} />
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cart.status === 'ACTIVE'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-600'
            }`}
        >
          {cart.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[var(--cf-dark)]">Giỏ hàng</h3>
        <p className="text-sm text-[var(--cf-primary)]/70">ID: {cart.id}</p>
        <p className="text-sm text-[var(--cf-primary)]/75">{cart.itemsCount} sản phẩm</p>
        <p className="text-xs text-[var(--cf-primary)]/50">{formatUpdatedAt(cart.createdAt)}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--cf-primary)]/10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-[var(--cf-primary)]/50 uppercase font-medium tracking-wider">Tổng tiền</span>
          <span className="text-xl font-bold text-[var(--cf-primary)]">{cart.totalAmount.toLocaleString('vi-VN')}₫</span>
        </div>
        <div className="text-sm font-semibold text-[var(--cf-primary)] flex items-center gap-1">
          Xem chi tiết
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

export default CartSummaryCard;
