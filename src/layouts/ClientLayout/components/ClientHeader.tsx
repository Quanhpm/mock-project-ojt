import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import logo2 from '@/assets/img/logo2.png';

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
          <Link to="/home" className="flex items-center gap-2">
            <img 
              src={logo2} 
              alt="Boutique Brews Logo" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Navigation - Public Links */}
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
          </nav>

          {/* Right Side - Guest Auth Buttons */}
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
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;