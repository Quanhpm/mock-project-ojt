import { Outlet } from 'react-router-dom';
import ClientHeader from '@/layouts/ClientLayout/components/ClientHeader';
import ClientFooter from '@/layouts/ClientLayout/components/ClientFooter';

/**
 * ContactLayout - Layout riêng cho Contact (PUBLIC)
 * Dùng ClientHeader + ClientFooter
 */
const ContactLayout = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-primary dark:text-gray-100 font-sans transition-colors duration-300 min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
};

export default ContactLayout;
