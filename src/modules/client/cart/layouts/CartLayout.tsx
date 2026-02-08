import { Outlet } from 'react-router-dom';
import { HomeHeader } from '@/modules/client/home/components';
import ClientFooter from '@/layouts/ClientLayout/components/ClientFooter';

/**
 * CartLayout - Layout cho trang Cart (PRIVATE)
 * Dành cho user đã đăng nhập
 * Sử dụng HomeHeader (có badge số lượng giỏ hàng) + ClientFooter
 */
const CartLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--cf-bg)]">
      <HomeHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
};

export default CartLayout;
