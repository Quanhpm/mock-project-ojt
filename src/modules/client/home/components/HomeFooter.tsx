import React from 'react';
import logo from '@/assets/img/logo.png';

/**
 * HomeFooter - Footer cho USER ĐÃ ĐĂNG NHẬP
 * Có thêm links cho các trang private
 */
const HomeFooter: React.FC = () => {
  return (
    <footer className="text-[var(--cf-primary)] mt-auto">
      {/* Top Section - Social & Feedback */}
      <div className="bg-[#e8dcc4] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Brand Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={logo} 
                  alt="Boutique Brews Logo" 
                  className="h-16 w-auto"
                />
                <h3 className="text-2xl font-bold uppercase tracking-wide text-white">BOUTIQUE BREWS</h3>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                Experience the world's finest coffee beans, ethically sourced and expertly roasted for your perfect cup.
              </p>
            </div>

            {/* Right Side - Feedback Section */}
            <div>
              <h3 className="text-xl font-bold mb-4 uppercase tracking-wider">Luôn Lắng Nghe</h3>
              <p className="text-sm mb-4 text-gray-700">
                Chúng tôi rất mong được lắng nghe về trải nghiệm của bạn ngày hôm nay
              </p>
              <button className="w-full bg-[var(--cf-primary)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--cf-dark)] transition-colors mb-2">
                 lắng nghe
              </button>
              <p className="text-xs text-gray-500">Chúng tôi tôn trọng quyền riêng tư của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Company Info */}
      <div className="bg-[var(--cf-primary)] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-sm space-y-2">
            <p className="font-semibold">Công ty TNHH Boutique Brews</p>
            <p>Mã số DN: 999999999</p>
            <p>Địa chỉ: FPT Software</p>
            <p className="text-white/80 pt-2">©2026 - 2026 CÔNG TY TNHH </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
