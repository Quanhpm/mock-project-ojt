import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';

const ClientHeader = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const logout = useClientAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="shadow-md" style={{ backgroundColor: 'var(--cf-surface)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold" style={{ color: 'var(--cf-primary)' }}>
              ShopLogo
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/shop" 
              className="transition-colors font-medium"
              style={{ color: 'var(--cf-dark)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cf-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cf-dark)'}
            >
              Cửa Hàng
            </Link>
            <Link 
              to="/about" 
              className="transition-colors font-medium"
              style={{ color: 'var(--cf-dark)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cf-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cf-dark)'}
            >
              Giới Thiệu
            </Link>
            <Link 
              to="/contact" 
              className="transition-colors font-medium"
              style={{ color: 'var(--cf-dark)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cf-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cf-dark)'}
            >
              Liên Hệ
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 transition-colors p-2 rounded-full hover:bg-gray-100"
              style={{ color: 'var(--cf-dark)' }}
            >
              <svg 
                className="w-8 h-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50"
                style={{ backgroundColor: 'var(--cf-surface)' }}
              >
                <div className="py-2">
                  <Link 
                    to="/client/profile" 
                    className="block px-4 py-2 transition-colors"
                    style={{ color: 'var(--cf-dark)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--cf-accent-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Hồ Sơ
                  </Link>
                  <Link 
                    to="/client/change-password" 
                    className="block px-4 py-2 transition-colors"
                    style={{ color: 'var(--cf-dark)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--cf-accent-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Đổi Mật Khẩu
                  </Link>
                  <hr className="my-2" style={{ borderColor: 'var(--cf-accent-light)' }} />
                  <button 
                    className="w-full text-left px-4 py-2 transition-colors"
                    style={{ color: 'var(--cf-dark)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--cf-accent-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={handleLogout}
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" style={{ color: 'var(--cf-dark)' }}>
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;