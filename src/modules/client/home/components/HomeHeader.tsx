import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuthStore } from '../../auth-client/stores/client-auth.store';

/**
 * HomeHeader - Header cho USER ĐÃ ĐĂNG NHẬP
 * Hiển thị: Cart, Profile, Change Password, Logout
 * Có avatar và dropdown menu
 */
const HomeHeader: React.FC = () => {
  const { user, logout, isLoggedIn } = useClientAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check login status
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/client/login');
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-bold text-[var(--cf-primary)]">
              BOUTIQUE BREWS
            </span>
          </Link>

          {/* Navigation - Logged-in User */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Trang Chủ
            </Link>
            <Link 
              to="/menu" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Thực Đơn
            </Link>
            <Link 
              to="/about" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Về Chúng Tôi
            </Link>
            <Link 
              to="/contact" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Liên Hệ Với Chúng Tôi
            </Link>
            <Link 
              to="/location" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Địa Điểm
            </Link>
            <Link 
              to="/franchise" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Nhượng Quyền
            </Link>
          </nav>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-4">
            {/* Cart Link */}
            <Link
              to="/home/cart"
              className="flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              🛒 Giỏ Hàng
            </Link>
            
            {/* Order History Link */}
            <Link
              to="/home/order-history"
              className="flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              📦 Lịch Sử Đơn Hàng
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cf-surface)] hover:bg-[var(--cf-accent-light)] transition-colors"
              >
              <img 
                src={user?.avatar_url || 'https://i.pravatar.cc/150'} 
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium text-[var(--cf-primary)]">{user?.name}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <Link
                  to="/home/profile"
                  className="block px-4 py-2 text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  👤 Hồ sơ cá nhân
                </Link>
                <Link
                  to="/home/change-password"
                  className="block px-4 py-2 text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  🔑 Đổi mật khẩu
                </Link>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  🚪 Đăng xuất
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
