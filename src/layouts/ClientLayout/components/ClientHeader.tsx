import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import { ShoppingCart, User, ChevronDown, LogOut, KeyRound, UserCircle } from 'lucide-react';
import logo2 from '@/assets/img/logo2.png';

/**
 * ClientHeader - Header động cho cả GUEST và USER đã đăng nhập
 * - Chưa đăng nhập: Login, Register
 * - Đã đăng nhập: Cart, Avatar, Dropdown (Profile, Change Password, Logout)
 */
const ClientHeader = () => {
  const { isLoggedIn, user, clearAuth } = useClientAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate('/', { replace: true });
    setTimeout(() => {
      clearAuth();
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
            {/* <Link 
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
            </Link> */}
            <Link 
              to="/location" 
              className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              Vị Trí
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative text-[var(--cf-primary)] hover:text-[var(--cf-dark)] transition-colors">
                  <ShoppingCart size={22} />
                </Link>

                {/* Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--cf-primary)]/20 hover:bg-[var(--cf-secondary)]/10 transition-all"
                  >
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <User size={18} className="text-[var(--cf-primary)]" />
                    )}
                    <span className="text-sm font-medium text-[var(--cf-primary)] hidden md:block max-w-[120px] truncate">
                      {user?.name ?? 'Tài khoản'}
                    </span>
                    <ChevronDown size={14} className={`text-[var(--cf-primary)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Đăng nhập với</p>
                        <p className="text-sm font-semibold text-[var(--cf-primary)] truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <UserCircle size={16} className="text-[var(--cf-primary)]" />
                        Hồ sơ của tôi
                      </Link>
                      <Link to="/change-password" onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <KeyRound size={16} className="text-[var(--cf-primary)]" />
                        Đổi mật khẩu
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={16} />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;