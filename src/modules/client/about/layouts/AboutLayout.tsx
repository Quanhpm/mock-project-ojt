import { Outlet } from 'react-router-dom';
import ClientHeader from '@/layouts/ClientLayout/components/ClientHeader';
import ClientFooter from '@/layouts/ClientLayout/components/ClientFooter';

/**
 * AboutLayout - Layout cho trang About (PUBLIC)
 * Dùng shared components: ClientHeader + ClientFooter
 */
const AboutLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--cf-bg)]">
      <ClientHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
};

export default AboutLayout;
