import { Outlet } from 'react-router-dom';
import ClientHeader from '@/layouts/ClientLayout/components/ClientHeader';
import ClientFooter from '@/layouts/ClientLayout/components/ClientFooter';
import { HomeFooter, HomeHeader } from '../../home/components';

/**
 * ContactLayout - Layout riêng cho Contact (PUBLIC)
 * Dùng HomeHeader + HomeFooter
 */
const ContactLayout = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-primary dark:text-gray-100 font-sans transition-colors duration-300 min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <HomeFooter />
    </div>
  );
};

export default ContactLayout;
