import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface CartDetailEmptyStateProps {
  onBack: () => void;
}

function CartDetailEmptyState({ onBack }: CartDetailEmptyStateProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] flex items-center justify-center">
      <div className="text-center">
        <ShoppingCart size={80} className="mx-auto text-[var(--cf-secondary)] opacity-30 mb-4" />
        <h2 className="text-2xl font-bold text-[var(--cf-dark)] mb-2">Không tìm thấy cart</h2>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--cf-secondary)] text-white font-semibold rounded-lg hover:bg-[var(--cf-dark)] transition-colors cursor-pointer"
          type="button"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách cart
        </button>
      </div>
    </div>
  );
}

export default CartDetailEmptyState;
