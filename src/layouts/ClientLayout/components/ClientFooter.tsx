import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, Clock, Coffee, ChevronRight, Building2, } from 'lucide-react';

const Logo = 'https://res.cloudinary.com/de2dyvcb7/image/upload/v1772263251/logo_kmr23x.png';

const QUICK_LINKS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Thực đơn', to: '/menu' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Liên hệ', to: '/contact' },
];

const SOCIAL_LINKS = [
  { icon: <Instagram size={18} />, href: '#', label: 'Instagram' },
  { icon: <Facebook size={18} />, href: '#', label: 'Facebook' },
  { icon: <Youtube size={18} />, href: '#', label: 'Youtube' },
];

/**
 * ClientFooter - Footer cho GUEST (chưa đăng nhập)
 */
const ClientFooter = () => {
  return (
    <footer className="mt-auto">
      {/* Main Footer */}
      <div className="bg-[var(--cf-secondary)] text-[var(--cf-text)]">
        <div className="container mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Col 1 - Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src={Logo} alt="Boutique Brews" className="h-10 w-10 object-contain" />
                <span className="text-xl font-black tracking-wide text-[var(--cf-primary)] uppercase">Boutique Brews</span>
              </div>
              <p className="text-sm text-[var(--cf-text-muted)] leading-relaxed mb-6">
                Hạt cà phê tinh tuyển toàn cầu, nguồn gốc minh bạch, rang xay chuẩn vị cho từng tách cà phê.
              </p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(s => (
                  <a key={s.label} href={s.href} aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-[var(--cf-primary)]/10 border border-[var(--cf-primary)]/20 flex items-center justify-center text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all duration-200">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 - Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--cf-primary)] mb-5">Điều hướng</h4>
              <ul className="space-y-3">
                {QUICK_LINKS.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-sm text-[var(--cf-text-muted)] hover:text-[var(--cf-primary)] transition-colors group">
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 - Contact */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--cf-primary)] mb-5">Liên hệ</h4>
              <ul className="space-y-3 text-sm text-[var(--cf-text-muted)]">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-[var(--cf-primary)] mt-0.5 shrink-0" />
                  <span>FPT Software, Hà Nội, Việt Nam</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-[var(--cf-primary)] shrink-0" />
                  <span>+84 123 456 789</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-[var(--cf-primary)] shrink-0" />
                  <span>hello@boutiquebrews.vn</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={16} className="text-[var(--cf-primary)] shrink-0" />
                  <span>07:00 – 22:00, T2 – CN</span>
                </li>
              </ul>
            </div>

            {/* Col 4 - Feedback */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--cf-primary)] mb-5">Luôn Lắng Nghe</h4>
              <p className="text-sm text-[var(--cf-text-muted)] leading-relaxed mb-4">
                Chúng tôi rất mong được lắng nghe về trải nghiệm của bạn ngày hôm nay.
              </p>
              <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg">
                <Coffee size={15} />
                Gửi ý kiến phản hồi
                <ChevronRight size={14} />
              </Link>
              <p className="text-xs text-[var(--cf-text-muted)] mt-3 italic">Chúng tôi tôn trọng quyền riêng tư của bạn</p>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--cf-primary)]/10" />

        {/* Bottom Bar */}
        <div className="bg-[var(--cf-primary)] text-white">
          <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-1 text-center md:text-left">
              <p className="font-bold text-sm">Công ty TNHH Boutique Brews</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/75">
                <span className='flex items-center gap-1'><Building2 size={15} /> Mã số DN: FS-GROUP-2</span>
                <span className='flex items-center gap-1'><MapPin size={15} /> Địa chỉ: FPT Software</span>
              </div>
            </div>
            <div className="text-center md:text-right text-white/75 space-y-1">
              <p>©2026 – 2026 CÔNG TY TNHH NHÓM 2-FS. All rights reserved.</p>
              <div className="flex gap-4 justify-center md:justify-end">
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;