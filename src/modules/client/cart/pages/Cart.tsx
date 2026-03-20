import { ShoppingBag, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientAuthStore } from '../../auth-client/stores/client-auth.store';
import { CartSummaryCard } from '../components';
import { useCartList } from '../hook/use-cart-list.hook';

function Cart() {
  const navigate = useNavigate();
  const user = useClientAuthStore((state) => state.user);
  const isLoggedIn = useClientAuthStore((state) => state.isLoggedIn);
  const {
    carts,
    totalItems,
    totalAmount,
    formatUpdatedAt,
  } = useCartList(user?.id, isLoggedIn);

  const openCartDetail = (cartId: string) => {
    navigate(`${ROUTER_URL.HOME_ROUTER.CART}/${cartId}`);
  };

  if (carts.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--cf-dark)]">Danh sách giỏ hàng</h2>
              <p className="text-[var(--cf-primary)]/65 mt-1">Quản lý các phiên mua sắm của bạn</p>
            </div>
            <button
              onClick={() => navigate(ROUTER_URL.MENU)}
              className="bg-[var(--cf-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--cf-dark)] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              Tiếp tục mua sắm
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[var(--cf-primary)]/10">
            <div className="w-24 h-24 bg-[var(--cf-bg)] rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={44} className="text-[var(--cf-secondary)]/40" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--cf-dark)]">Không tìm thấy giỏ hàng nào</h3>
            <p className="text-[var(--cf-primary)]/60 max-w-xs mx-auto mt-2">
              Bạn chưa có giỏ hàng nào được tạo. Hãy bắt đầu mua sắm ngay.
            </p>
            <button
              onClick={() => navigate(ROUTER_URL.MENU)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--cf-secondary)] text-white font-semibold rounded-lg hover:bg-[var(--cf-dark)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
              Tạo giỏ hàng mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--cf-dark)]">Danh sách giỏ hàng</h2>
            <p className="text-[var(--cf-primary)]/65 mt-1">
              Có {carts.length} cart hoạt động, tổng {totalItems} sản phẩm
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTER_URL.MENU)}
            className="bg-[var(--cf-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--cf-dark)] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Tiếp tục mua sắm
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {carts.map((cart) => (
            <CartSummaryCard
              cart={cart}
              formatUpdatedAt={formatUpdatedAt}
              key={cart.id}
              onOpenDetail={openCartDetail}
            />
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl border border-[var(--cf-primary)]/10 p-4 flex items-center justify-between">
          <p className="text-sm text-[var(--cf-primary)]/70">Tổng giá trị tất cả cart đang hoạt động</p>
          <p className="text-2xl font-black text-[var(--cf-primary)]">{totalAmount.toLocaleString('vi-VN')} ₫</p>
        </div>
      </div>
    </div>
  );
}

export default Cart;