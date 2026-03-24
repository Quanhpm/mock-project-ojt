import React from 'react';
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientAuthStore } from '../../auth-client/stores/client-auth.store';
import { CartSummaryCard } from '../components';
import { useCartList } from '../hooks/use-cart-list.hook';

// interface CartGridConfig {
//   containerClassName: string;
//   getItemClassName: (index: number) => string;
// }

// const getCartGridConfig = (cartCount: number): CartGridConfig => {
//   if (cartCount <= 1) {
//     return {
//       containerClassName: 'grid-cols-1',
//       getItemClassName: () => 'col-span-full',
//     };
//   }

//   if (cartCount === 2) {
//     return {
//       containerClassName: 'grid-cols-2',
//       getItemClassName: () => 'col-span-1',
//     };
//   }

//   return {
//     // Use a 6-column base grid to keep the visual 3-column layout,
//     // while still allowing the last row to split evenly for remainder cases.
//     containerClassName: 'grid-cols-6',
//     getItemClassName: (index: number) => {
//       const remainingItems = cartCount - index;
//       const remainder = cartCount % 3;

//       if (remainder === 1 && remainingItems === 1) {
//         return 'col-span-full';
//       }

//       if (remainder === 2 && remainingItems <= 2) {
//         return 'col-span-3';
//       }

//       return 'col-span-2';
//     },
//   };
// };

function Cart() {
  const navigate = useNavigate();
  const user = useClientAuthStore((state) => state.user);
  const isLoggedIn = useClientAuthStore((state) => state.isLoggedIn);
  const { carts, totalItems, totalAmount, formatUpdatedAt } = useCartList(user?.id, isLoggedIn);
  // const cartGridConfig = getCartGridConfig(carts.length);

  const openCartDetail = (cartId: string) => {
    navigate(`${ROUTER_URL.HOME_ROUTER.CART}/${cartId}`);
  };

  // Thêm
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [itemsPerView, setItemsPerView] = React.useState(getItemsPerView);

  React.useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = getItemsPerView();
      setItemsPerView(newItemsPerView);
      setCurrentIndex(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, carts.length - itemsPerView);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  if (carts.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] text-[var(--cf-dark)]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-10 pb-20">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Giỏ hàng của bạn</h1>
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
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-10 pb-24">
        <section className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
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

        {/* Phần div cần sửa */}
        <div className="relative">
          {/* Nút Previous */}
          {canGoPrev && (
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-[var(--cf-primary)]/20 shadow-lg flex items-center justify-center text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all duration-200 cursor-pointer"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Nút Next */}
          {canGoNext && (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-[var(--cf-primary)]/20 shadow-lg flex items-center justify-center text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all duration-200 cursor-pointer"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          )}
          
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-400 ease-in-out"
              style={{
                gap: '32px',
                transform: `translateX(calc(-${currentIndex} * (100% / ${itemsPerView} + ${32 / itemsPerView}px)))`,
              }}
            >
              {carts.map((cart) => (
                <div
                  key={cart.id}
                  className="flex-shrink-0"
                  style={{ width: `calc((100% - ${32 * (itemsPerView - 1)}px) / ${itemsPerView})` }}
                >
                  <CartSummaryCard
                    cart={cart}
                    formatUpdatedAt={formatUpdatedAt}
                    onOpenDetail={openCartDetail}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          {carts.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === currentIndex
                    ? 'w-6 bg-[var(--cf-primary)]'
                    : 'w-2 bg-[var(--cf-primary)]/25 hover:bg-[var(--cf-primary)]/50'
                    }`}
                  type="button"
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-[var(--cf-primary)]/10 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[0px_12px_32px_rgba(28,27,27,0.04)]">
          <p className="text-sm md:text-base text-[var(--cf-primary)]/75">
            Tổng giá trị tất cả giỏ hàng đang hoạt động: <span className="font-semibold">{totalItems} sản phẩm</span>
          </p>
          <p className="text-2xl md:text-3xl font-black text-[var(--cf-primary)] tracking-tight">{totalAmount.toLocaleString('vi-VN')} đ</p>
        </div>
      </div>
    </div>
  );
}

export default Cart;
