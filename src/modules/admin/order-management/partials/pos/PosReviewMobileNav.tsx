import { CreditCard, ShoppingCart, Store } from "lucide-react";

interface PosReviewMobileNavProps {
  canCheckout: boolean;
  isMutatingCart: boolean;
  onBack: () => void;
  onCheckout: () => void | Promise<void>;
}

export const PosReviewMobileNav = ({
  canCheckout,
  isMutatingCart,
  onBack,
  onCheckout,
}: PosReviewMobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={onBack}
        className="flex w-20 flex-col items-center gap-1 text-gray-400 transition hover:text-amber-800"
      >
        <ShoppingCart size={20} />
        <span className="text-center text-[10px] font-bold uppercase tracking-widest">Giỏ hàng</span>
      </button>
      <div className="flex w-20 flex-col items-center gap-1 text-amber-800">
        <Store size={20} />
        <span className="text-center text-[10px] font-bold uppercase tracking-widest">Chi tiết</span>
      </div>
      <button
        type="button"
        onClick={() => {
          void onCheckout();
        }}
        disabled={!canCheckout || isMutatingCart}
        className="flex w-20 flex-col items-center gap-1 text-gray-400 transition hover:text-amber-800 disabled:opacity-50"
      >
        <CreditCard size={20} />
        <span className="text-center text-[10px] font-bold uppercase tracking-widest">Checkout</span>
      </button>
    </div>
  );
};
