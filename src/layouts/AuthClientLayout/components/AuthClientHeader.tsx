import { Link } from 'react-router-dom';

const AuthClientHeader = () => {
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

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/auth/login" 
              className="transition-colors font-medium"
              style={{ color: 'var(--cf-dark)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cf-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cf-dark)'}
            >
              Đăng Nhập
            </Link>
            <Link 
              to="/auth/register" 
              className="text-white px-4 py-2 rounded-lg transition-colors font-medium"
              style={{ backgroundColor: 'var(--cf-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--cf-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--cf-primary)'}
            >
              Đăng Ký
            </Link>
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

export default AuthClientHeader;
