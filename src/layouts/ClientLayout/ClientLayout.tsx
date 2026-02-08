import { Outlet } from 'react-router';
import ClientHeader from './components/ClientHeader';
import HomeHeader from './components/HomeHeader';
import ClientFooter from './components/ClientFooter';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';

/**
 * ClientLayout - Layout động
 * - GUEST (chưa đăng nhập): Dùng ClientHeader
 * - USER (đã đăng nhập): Dùng HomeHeader
 */
function ClientLayout() {
  const { isLoggedIn } = useClientAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--cf-bg)]">
      {isLoggedIn ? <HomeHeader /> : <ClientHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}

export default ClientLayout;
