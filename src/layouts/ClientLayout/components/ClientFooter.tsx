import logo from '@/assets/img/logo.png';

/**
 * ClientFooter - Footer cho GUEST (chưa đăng nhập)
 * Design 2 phần: Social/Feedback + Company Info
 */
const ClientFooter = () => {
  return (
    <footer className="text-[var(--cf-primary)] mt-auto">
      {/* Top Section - Social & Feedback */}
      <div className="bg-[#e8dcc4] py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Brand Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={logo} 
                  alt="Boutique Brews Logo" 
                  className="h-10 w-auto"
                />
                <h3 className="text-lg font-bold uppercase tracking-wide text-white">BOUTIQUE BREWS</h3>
              </div>
              <p className="text-white/90 text-xs leading-relaxed">
                Hạt cà phê tinh tuyển toàn cầu, nguồn gốc minh bạch, rang xay chuẩn vị cho từng tách cà phê.
              </p>
            </div>

            {/* Right Side - Feedback Section */}
            <div>
              <h3 className="text-base font-bold mb-2 uppercase tracking-wider">Luôn Lắng Nghe</h3>
              <p className="text-xs mb-3 text-gray-700">
                Chúng tôi rất mong được lắng nghe về trải nghiệm của bạn ngày hôm nay
              </p>
              <button className="w-full bg-[var(--cf-primary)] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[var(--cf-dark)] transition-colors mb-1">
                Boutique Brews luôn lắng nghe
              </button>
              <p className="text-xs text-gray-500">Chúng tôi tôn trọng quyền riêng tư của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Company Info */}
      <div className="bg-[var(--cf-primary)] text-white py-4">
        <div className="container mx-auto px-4">
          <div className="text-xs space-y-1">
            <p className="font-semibold">Công ty TNHH Boutique Brews</p>
            <p>Mã số DN: FS-GROUP-2</p>
            <p>Địa chỉ: FPT Software</p>
            <p className="text-white/80 pt-1">©2026 - 2026 CÔNG TY TNHH NHÓM 2-FS </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;