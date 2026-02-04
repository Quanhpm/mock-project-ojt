import React from 'react';
import { Link } from 'react-router-dom';

/**
 * HomeFooter - Footer cho USER ĐÃ ĐĂNG NHẬP
 * Có thêm links cho các trang private
 */
const HomeFooter: React.FC = () => {
  return (
    <footer className="bg-[var(--cf-primary)] text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">☕</span>
              BOUTIQUE BREWS
            </h3>
            <p className="text-white/80 text-sm">
              Mang đến những hạt cà phê tuyệt vời nhất từ khắp nơi trên thế giới.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
              <li><Link to="/menu" className="hover:text-white transition-colors">Menu</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="font-semibold mb-4">Tài khoản của tôi</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/home/cart" className="hover:text-white transition-colors">Giỏ hàng</Link></li>
              <li><Link to="/home/order-history" className="hover:text-white transition-colors">Đơn hàng</Link></li>
              <li><Link to="/home/profile" className="hover:text-white transition-colors">Hồ sơ</Link></li>
              <li><Link to="/home/change-password" className="hover:text-white transition-colors">Đổi mật khẩu</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>📞 1900-xxxx</li>
              <li>📧 contact@boutiquebrews.com</li>
              <li>📍 123 Coffee Street, HCM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
          © 2026 Boutique Brews. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
