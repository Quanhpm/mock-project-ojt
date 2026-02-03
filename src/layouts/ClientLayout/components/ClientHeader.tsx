import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';

/**
 * ClientHeader - Header động cho cả GUEST và USER đã đăng nhập
 * - Chưa đăng nhập: Login, Register
 * - Đã đăng nhập: Cart, Avatar, Dropdown (Profile, Change Password, Logout)
 */
const ClientHeader = () => {
  const { isLoggedIn, user, logout } = useClientAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-bold text-[var(--cf-primary)]">
              BOUTIQUE BREWS
            </span>
          </Link>

          {/* Navigation - Public Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Homepage
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
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              to="/location" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Location
            </Link>
          </nav>

          {/* Right Side - Auth or User Menu */}
          {isLoggedIn ? (
            // Logged-in User Menu
            <div className="flex items-center gap-4">
              {/* Cart Link */}
              <Link
                to="/home/cart"
                className="flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
              >
                🛒 Giỏ hàng
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
                    <Link
                      to="/home/order-history"
                      className="block px-4 py-2 text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      📦 Đơn hàng
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
          ) : (
            // Guest Auth Buttons
            <div className="flex items-center gap-4">
              <Link
                to="/client/login"
                className="px-4 py-2 font-semibold text-[var(--cf-secondary)] hover:text-[var(--cf-dark)] transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/client/register"
                className="px-6 py-2 font-semibold text-white bg-[var(--cf-secondary)] hover:bg-[var(--cf-dark)] rounded-lg shadow-md transition-all"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;