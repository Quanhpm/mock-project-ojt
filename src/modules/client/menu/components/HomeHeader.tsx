import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuthStore } from '../../auth-client/stores/client-auth.store';
import { useCartStore } from '@/stores/cart.store';
import { ShoppingCart, Package } from 'lucide-react';

/**
 * HomeHeader - Header cho USER ĐÃ ĐĂNG NHẬP
 * Hiển thị: Cart, Profile, Change Password, Logout
 * Có avatar và dropdown menu
 */
const HomeHeader: React.FC = () => {
  const { user, logout } = useClientAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
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
              Trang chủ
            </Link>
            <Link 
              to="/menu" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Menu
            </Link>
            <Link 
              to="/about" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Về chúng tôi
            </Link>
            <Link 
              to="/contact" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Liên hệ
            </Link>
            <Link 
              to="/home/cart" 
              className="relative flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              <ShoppingCart size={20} />
              <span>Giỏ hàng</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link 
              to="/home/order-history" 
              className="flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              <Package size={20} />
              <span>Đơn hàng</span>
            </Link>
          </nav>

          {/* User Menu */}
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
    </header>
  );
};

export default HomeHeader;
