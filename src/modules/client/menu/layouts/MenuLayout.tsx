import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';

/**
 * HomeLayout - Layout cho USER ĐÃ ĐĂNG NHẬP
 * Nằm trong folder home/
 * Chỉ được truy cập qua ClientGuard
 * Header: Cart, Profile, Change Password, Logout
 */
const HomeLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--cf-bg)]">
      <HomeHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <HomeFooter />
    </div>
  );
};

export default HomeLayout;
