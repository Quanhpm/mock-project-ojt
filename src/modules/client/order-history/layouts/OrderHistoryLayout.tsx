import { Outlet } from 'react-router-dom';
import { HomeFooter, HomeHeader } from '../../home/components';

/**
 * OrderHistoryLayout - Layout riêng cho Order History (PRIVATE)
 * Dùng HomeHeader + HomeFooter
 */
const OrderHistoryLayout = () => {
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

export default OrderHistoryLayout;
