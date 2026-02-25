import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import { useCartStore } from '@/stores/cart.store';
import { ShoppingCart, ClipboardClock, User, KeyRound, LogOut } from 'lucide-react';
import logo2 from '@/assets/img/logo2.png';
/**
 * HomeHeader - Header cho USER ĐÃ ĐĂNG NHẬP
 * Hiển thị: Cart, Profile, Change Password, Logout
 * Có avatar và dropdown menu
 */
const HomeHeader: React.FC = () => {
  const { user, logout, isLoggedIn } = useClientAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    // Navigate trước, logout sau để tránh ClientGuard redirect về login
    navigate('/', { replace: true });
    // Delay logout một chút để navigate hoàn thành trước
    setTimeout(() => {
      logout();
    }, 50);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo2} 
              alt="Boutique Brews Logo" 
              className="h-16 w-auto"
            />
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
              Sản Phẩm
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
              Liên Hệ
            </Link>
            <Link
              to="/location"
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Vị Trí
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
              to="/cart"
              className="relative flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              <ShoppingCart />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Order History Link */}
            <Link
              to="/order-history"
              className="flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              <ClipboardClock />
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="!cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cf-surface)] hover:bg-[var(--cf-accent-light)] transition-colors"
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
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)] transition-colors rounded-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" /> Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/change-password"
                    className="w-full flex items-center gap-2 px-4 py-2 text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)] transition-colors rounded-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <KeyRound className="w-4 h-4" /> Đổi mật khẩu
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="!cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-[var(--cf-accent-light)] transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
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
