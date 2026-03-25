import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import { ShoppingCart, User, ChevronDown, LogOut, KeyRound, UserCircle, Menu, X, House, CupSoda, MapPin, Info, LogIn, UserPlus, Globe, Share2, Store } from 'lucide-react';
import { useClientLogout } from '@/modules/client/auth-client/hooks/use-client-logout.hook';
import { getAllFranchises, type FranchiseResponse } from '@/apis/endpointsCLIENT/client.api';
import { useStore as useMenuStore } from '@/modules/client/menu/hooks/use-store.hook';
import logo2 from '@/assets/img/logo2.png';

/**
 * ClientHeader - Header động cho cả GUEST và USER đã đăng nhập
 * - Chưa đăng nhập: Login, Register
 * - Đã đăng nhập: Cart, Avatar, Dropdown (Profile, Change Password, Logout)
 */
const ClientHeader = () => {
  const { isLoggedIn, user } = useClientAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useClientLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [franchises, setFranchises] = useState<FranchiseResponse[]>([]);
  const selectedFranchiseId = useMenuStore((state) => state.franchiseId);
  const setFranchiseId = useMenuStore((state) => state.setFranchiseId);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mobileMenuItems = [
    { to: '/', label: 'Trang Chủ', icon: House },
    { to: '/menu', label: 'Sản Phẩm', icon: CupSoda },
    { to: '/location', label: 'Địa Điểm', icon: MapPin },
    { to: '/about', label: 'Về Chúng Tôi', icon: Info },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFranchises = async () => {
      try {
        const response = await getAllFranchises();
        const nextFranchises = response ?? [];

        if (!isMounted) {
          return;
        }

        setFranchises(nextFranchises);

        if (!selectedFranchiseId && nextFranchises.length > 0) {
          setFranchiseId(nextFranchises[0].id);
        }
      } catch {
        if (isMounted) {
          setFranchises([]);
        }
      }
    };

    fetchFranchises();

    return () => {
      isMounted = false;
    };
  }, [selectedFranchiseId, setFranchiseId]);

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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    // Redirect sau khi logout thành công (store đã clear)
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16">
          {/* Left: Mobile hamburger + Logo */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--cf-primary)]/20 text-[var(--cf-primary)] hover:bg-[var(--cf-secondary)]/10 transition-colors"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex items-center gap-2" onClick={closeMobileMenu}>
              <img
                src={logo2}
                alt="Boutique Brews Logo"
                className="h-12 lg:h-16 w-auto"
              />
            </Link>
          </div>

          {/* Navigation - Public Links */}
          <nav className="hidden lg:flex items-center gap-8">
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

          {franchises.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 min-w-[230px]">
              <Store size={40} className="text-[var(--cf-primary)]" />
              <select
                value={selectedFranchiseId}
                onChange={(event) => setFranchiseId(event.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-[var(--cf-secondary)]/25 bg-white px-3 text-sm text-[var(--cf-dark)] shadow-sm transition-all focus:border-[var(--cf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/20"
                aria-label="Chọn chi nhánh"
              >
                {franchises.map((franchise) => (
                  <option key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-4">
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
                  className="hidden lg:block px-3 lg:px-4 py-2 text-sm lg:text-base font-semibold text-[var(--cf-secondary)] hover:text-[var(--cf-dark)] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/client/register"
                  className="hidden lg:block px-4 lg:px-6 py-2 text-sm lg:text-base font-semibold text-white bg-[var(--cf-secondary)] hover:bg-[var(--cf-dark)] rounded-lg shadow-md transition-all"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="absolute inset-0 bg-black/25" onClick={closeMobileMenu} />

        <div
          className={`absolute top-0 left-0 h-full w-[88%] max-w-[320px] bg-[var(--cf-bg)] shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-5 pt-7 pb-6 border-b border-[var(--cf-secondary)]/20">
            <span className="text-[36px] leading-none font-black text-[var(--cf-primary)]">Boutique Brews</span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[var(--cf-secondary)]"
              aria-label="Đóng menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="px-3 pt-5 space-y-2">
            {mobileMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-lg font-semibold transition-all ${isActive ? 'bg-[var(--cf-primary)] text-white shadow-lg' : 'text-[var(--cf-primary)] hover:bg-[var(--cf-surface)]/35'}`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-[var(--cf-secondary)]'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {franchises.length > 0 && (
              <div className="mt-4 rounded-xl border border-[var(--cf-secondary)]/20 bg-white/70 px-3 py-3">
                <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--cf-secondary)]">
                  <Store size={16} className="text-[var(--cf-primary)]" />
                  Chọn chi nhánh
                </label>
                <select
                  value={selectedFranchiseId}
                  onChange={(event) => setFranchiseId(event.target.value)}
                  className="h-11 w-full cursor-pointer rounded-lg border border-[var(--cf-secondary)]/25 bg-white px-3 text-sm text-[var(--cf-dark)] focus:border-[var(--cf-primary)] focus:outline-none"
                  aria-label="Chọn chi nhánh"
                >
                  {franchises.map((franchise) => (
                    <option key={franchise.id} value={franchise.id}>
                      {franchise.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </nav>

          <div className="mt-7 mx-4 border-t border-[var(--cf-secondary)]/20" />

          <div className="mx-4 mt-5 p-3 rounded-xl bg-transparent">


            {isLoggedIn ? (
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#4b3026] text-white font-bold py-3 rounded-xl"
              >
                <UserCircle size={16} />
                My Profile
              </Link>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/client/login"
                  onClick={closeMobileMenu}
                  className="w-full flex items-center justify-center gap-2 border border-[var(--cf-primary)] text-[var(--cf-primary)] font-bold py-3 rounded-xl bg-white"
                >
                  <LogIn size={16} />
                  Đăng nhập
                </Link>
                <Link
                  to="/client/register"
                  onClick={closeMobileMenu}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] text-white font-bold py-3 rounded-xl"
                >
                  <UserPlus size={16} />
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          <div className="mt-auto pb-6 pt-4 text-center text-[var(--cf-secondary)]/70">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Globe size={16} />
              <Share2 size={16} />
            </div>
            <p className="text-[11px] tracking-widest font-semibold">© 2024 BOUTIQUE BREWS CO.</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
