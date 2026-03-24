import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientAuthStore } from '../../auth-client/stores/client-auth.store';
import { CartSummaryCard } from '../components';
import { useCartList } from '../hooks/use-cart-list.hook';

function Cart() {
  const navigate = useNavigate();
  const user = useClientAuthStore((state) => state.user);
  const isLoggedIn = useClientAuthStore((state) => state.isLoggedIn);
  const { carts, totalItems, totalAmount, formatUpdatedAt } = useCartList(user?.id, isLoggedIn);

  const openCartDetail = (cartId: string) => {
    navigate(`${ROUTER_URL.HOME_ROUTER.CART}/${cartId}`);
  };

  if (carts.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] text-[var(--cf-dark)]">
        <div className="max-w-screen-2xl mx-auto px-4 pt-10 pb-20">
          <div className="mb-12 flex flex-col justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Giỏ hàng của bạn</h1>
              <p className="text-[var(--cf-primary)]/70 text-lg mt-2">Bạn chưa có giỏ hàng nào đang chờ xử lý</p>
            </div>
            <button
              onClick={() => navigate(ROUTER_URL.MENU)}
              className="group flex items-center gap-2 bg-[var(--cf-primary)] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[var(--cf-primary)]/20 cursor-pointer"
              type="button"
            >
              <ArrowLeft size={18} />
              Tiếp tục mua sắm
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-[var(--cf-primary)]/10 shadow-[0px_20px_60px_rgba(28,27,27,0.06)]">
            <div className="w-32 h-32 bg-[var(--cf-bg)] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={52} className="text-[var(--cf-primary)]/45" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bạn chưa có giỏ hàng nào</h2>
            <p className="text-[var(--cf-primary)]/60 mb-8 max-w-xs mx-auto">
              Khám phá thực đơn đặc biệt của chúng tôi và bắt đầu hành trình hương vị.
            </p>
            <button
              onClick={() => navigate(ROUTER_URL.MENU)}
              className="bg-[var(--cf-primary)] text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-[var(--cf-primary)]/20 hover:bg-[var(--cf-dark)] transition-colors cursor-pointer"
              type="button"
            >
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] text-[var(--cf-dark)]">
      <div className="max-w-screen-2xl mx-auto px-4 pt-10 pb-24">
        <section className="flex flex-col justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--cf-dark)] mb-2 tracking-tight">Giỏ hàng của bạn</h1>
            <p className="text-[var(--cf-primary)]/75 text-lg">
              Bạn có {carts.length} giỏ hàng đang chờ xử lý
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTER_URL.MENU)}
            className="group flex items-center gap-2 bg-[var(--cf-primary)] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[var(--cf-primary)]/20 cursor-pointer"
            type="button"
          >
            <ArrowLeft size={18} />
            Tiếp tục mua sắm
          </button>
        </section>

        <div className="flex flex-col gap-8">
          {carts.map((cart) => (
            <div className="w-full" key={cart.id}>
              <CartSummaryCard
                cart={cart}
                formatUpdatedAt={formatUpdatedAt}
                onOpenDetail={openCartDetail}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-[var(--cf-primary)]/10 p-5 flex flex-col gap-3 shadow-[0px_12px_32px_rgba(28,27,27,0.04)]">
          <p className="text-sm text-[var(--cf-primary)]/75">
            Tổng giá trị tất cả giỏ hàng đang hoạt động: <span className="font-semibold">{totalItems} sản phẩm</span>
          </p>
          <p className="text-2xl font-black text-[var(--cf-primary)] tracking-tight">{totalAmount.toLocaleString('vi-VN')} đ</p>
        </div>
      </div>
    </div>
  );
}

export default Cart;