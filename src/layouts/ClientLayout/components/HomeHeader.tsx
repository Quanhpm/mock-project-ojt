import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getOrdersByCustomerId } from '@/apis/endpointsCLIENT';
import { countCustomerCarts } from '@/apis/endpointsCLIENT/cart.api';
import { useToast } from '@/hooks/use-toast.hook';
import logo2 from '@/assets/img/logo2.png';
import { useAuth } from '@/modules/client/auth-client/context/useAuth';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import { normalizeOrdersPayload } from '@/modules/client/order-history/order.utils';
import { getAllFranchises, type FranchiseResponse } from '@/apis/endpointsCLIENT/client.api';
import { useStore as useMenuStore } from '@/modules/client/menu/hooks/use-store.hook';
import { useLoadingStore } from '@/stores/loading.store';
import { ShoppingCart, ClipboardClock, User, LogOut, Menu, X, House, CupSoda, MapPin, Building2, Globe, Share2, Sparkles, Gem } from 'lucide-react';

import { ShoppingCart, ClipboardClock, User, LogOut, Menu, X, House, CupSoda, MapPin, Building2, Globe, Share2, Sparkles, Gem, ChevronDown, Store } from 'lucide-react';
const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/de2dyvcb7/image/upload/v1774416364/656316159_2765483763813101_1192292787245113307_n_kr1os8.png?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExMEU4VTBtbWMxR1BqV3JJQnNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7mDjwZ2GYTsnzs9LxPUaahnkXp2BCJjlLXBWw4D10khK11nfzUFnqKzf7phw_aem_c0TH6FN1XaCmQQSHionzKw';

const HomeHeader: React.FC = () => {
  const { logout } = useAuth();
  const profile = useClientAuthStore((state) => state.user);
  const isLoggedIn = useClientAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [processingOrdersCount, setProcessingOrdersCount] = useState(0);
  const [franchises, setFranchises] = useState<FranchiseResponse[]>([]);
  const selectedFranchiseId = useMenuStore((state) => state.franchiseId);
  const setFranchiseId = useMenuStore((state) => state.setFranchiseId);
  const incrementLoading = useLoadingStore((state) => state.increment);
  const decrementLoading = useLoadingStore((state) => state.decrement);
  const { success, error } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mobileMenuItems = [
    { to: '/', label: 'Trang Chủ', icon: House },
    { to: '/menu', label: 'Sản Phẩm', icon: CupSoda },
    { to: '/location', label: 'Địa Điểm', icon: MapPin },
    { to: '/franchise', label: 'Nhượng Quyền', icon: Building2 },
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

  useEffect(() => {
    const customerId = profile?.id;

    if (!customerId) {
      setProcessingOrdersCount(0);
      return;
    }

    let isMounted = true;

    const fetchProcessingOrders = async () => {
      try {
        const response = await getOrdersByCustomerId(String(customerId));
        const normalized = normalizeOrdersPayload(response);
        const count = normalized.orders.filter(
          (order) =>
            order.status.code === 'DRAFT' ||
            order.status.code === 'PREPARING' ||
            order.status.code === 'CONFIRMED' ||
            order.status.code === 'READY_FOR_PICKUP',
        ).length;

        if (isMounted) {
          setProcessingOrdersCount(count);
        }
      } catch {
        if (isMounted) {
          setProcessingOrdersCount(0);
        }
      }
    };

    fetchProcessingOrders();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  useEffect(() => {
    const loadCartCount = async () => {
      if (!isLoggedIn || !profile?.id) {
        setCartCount(0);
        return;
      }

      if (location.pathname.startsWith('/cart')) {
        return;
      }

      try {
        const result = await countCustomerCarts(profile.id, 'ACTIVE');
        setCartCount(result?.count ?? 0);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
  }, [isLoggedIn, location.pathname, profile?.id]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    closeMobileMenu();
    setIsLoggingOut(true);
    const result = await logout();
    if (result.success) {
      success(result.message || 'Đăng xuất thành công');
      navigate('/', { replace: true });
    } else {
      setIsLoggingOut(false);
      error(result.message || 'Đăng xuất thất bại');
    }
  };

  const navigateWithLoading = (path: string, options?: { closeDropdown?: boolean; closeMenu?: boolean }) => {
    if (options?.closeDropdown) {
      setIsDropdownOpen(false);
    }

    if (options?.closeMenu) {
      closeMobileMenu();
    }

    incrementLoading();
    navigate(path);

    window.setTimeout(() => {
      decrementLoading();
    }, 350);
  };

  if (isLoggingOut) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm md:sticky md:top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--cf-primary)]/20 text-[var(--cf-primary)] hover:bg-[var(--cf-secondary)]/10 transition-colors"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center gap-2" onClick={closeMobileMenu}>
              <img
                src={logo2}
                alt="Boutique Brews Logo"
                className="h-12 md:h-16 w-auto"
              />
            </Link>
          </div>

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

          {franchises.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 min-w-[230px]">
              <span className="material-icons-outlined text-base text-[var(--cf-primary)]">storefront</span>
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

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              <ShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/order-history"
              className="relative flex items-center gap-2 text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] font-medium transition-colors"
            >
              <ClipboardClock />
              {processingOrdersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {processingOrdersCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className="md:hidden inline-flex items-center justify-center p-1 rounded-lg bg-[var(--cf-surface)] hover:bg-[var(--cf-accent-light)] transition-colors"
              onClick={(event) => {
                event.preventDefault();
                navigateWithLoading('/profile', { closeMenu: true });
              }}
            >
              <img
                src={profile?.avatar_url || DEFAULT_AVATAR_URL}
                alt={profile?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>

            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="!cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cf-surface)] hover:bg-[var(--cf-accent-light)] transition-colors"
              >
                <img
                  src={profile?.avatar_url || DEFAULT_AVATAR_URL}
                  alt={profile?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-[var(--cf-primary)]">{profile?.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)] transition-colors rounded-lg"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateWithLoading('/profile', { closeDropdown: true });
                    }}
                  >
                    <User className="w-4 h-4" /> Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/loyalty"
                    className="flex items-center gap-2 px-4 py-2 text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)] transition-colors rounded-lg"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateWithLoading('/loyalty', { closeDropdown: true });
                    }}
                  >
                    <Gem className="w-4 h-4" /> Khách hàng thân thiết
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

      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
            <Link
              to="/order-history"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-lg font-semibold transition-all ${location.pathname === '/order-history' ? 'bg-[var(--cf-primary)] text-white shadow-lg' : 'text-[var(--cf-primary)] hover:bg-[var(--cf-surface)]/35'}`}
            >
              <ClipboardClock size={18} className={location.pathname === '/order-history' ? 'text-white' : 'text-[var(--cf-secondary)]'} />
              <span>Lịch Sử Đơn Hàng</span>
            </Link>
            <Link
              to="/loyalty"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-lg font-semibold transition-all ${location.pathname === '/loyalty' ? 'bg-[var(--cf-primary)] text-white shadow-lg' : 'text-[var(--cf-primary)] hover:bg-[var(--cf-surface)]/35'}`}
            >
              <Sparkles size={18} className={location.pathname === '/loyalty' ? 'text-white' : 'text-[var(--cf-secondary)]'} />
              <span>Khách hàng thân thiết</span>
            </Link>

            {franchises.length > 0 && (
              <div className="mt-4 rounded-xl border border-[var(--cf-secondary)]/20 bg-white/70 px-3 py-3">
                <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--cf-secondary)]">
                  <span className="material-icons-outlined text-base text-[var(--cf-primary)]">storefront</span>
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
            <div className="flex items-center gap-3">
              <img
                src={profile?.avatar_url || DEFAULT_AVATAR_URL}
                alt={profile?.name}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div>
                <p className="text-[var(--cf-primary)] font-bold leading-tight">Chào mừng trở lại</p>
                <p className="text-xl text-[var(--cf-secondary)] leading-tight">{profile?.name ?? 'User'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] text-white font-bold py-3 rounded-xl"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
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

export default HomeHeader;
