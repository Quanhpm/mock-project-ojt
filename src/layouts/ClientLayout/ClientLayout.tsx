import { Outlet } from 'react-router';
import ClientHeader from './components/ClientHeader';
import ClientFooter from './components/ClientFooter';

/**
 * ClientLayout - Layout cho GUEST (chưa đăng nhập)
 * Sử dụng cho các route public: /, /menu, /about, /contact
 * Header: Home, Menu, About, Contact, Login, Register
 * Footer: Thông tin cơ bản
 */
function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--cf-bg)]">
      <ClientHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}

export default ClientLayout;
