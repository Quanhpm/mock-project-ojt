import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import products from '@/mockdata/products.json';
import worldMapImage from '@/assets/img/anh-home-page.png';
import Logo from '@/assets/img/logobb.png';
import ProductCard from '../components/ProductCard';
import AboutPage from '@/modules/client/about/pages/AboutPage';
import ContactPage from '@/modules/client/contact/pages/ContactPage';
import { Coffee } from "lucide-react";

interface Product {
    id: number;
    SKU: string;
    name: string;
    description: string;
    content: string;
    image_url: string;
    category_id: number;
    min_price: number;
    max_price: number;
    is_active: boolean;
    is_deleted: boolean;
}

const MENU_DATA = (products as Product[])
  .filter(p => p.is_active && !p.is_deleted && p.category_id === 3)
  .slice(0, 5)
  .map(p => ({ id: p.id, name: p.name, title: p.name.toUpperCase(), img: p.image_url }));

const SIGNATURE_DRINKS = (products as Product[])
  .filter(p => p.is_active && !p.is_deleted && [1, 2].includes(p.category_id))
  .sort((a, b) => b.max_price - a.max_price)
  .slice(0, 5)
  .map(p => ({ id: p.id, name: p.name, title: p.name.toUpperCase(), img: p.image_url }));

const BANNER_SLIDES = [
  { id: 1, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop' },
  { id: 2, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600&auto=format&fit=crop' },
  { id: 3, img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1600&auto=format&fit=crop' },
  { id: 4, img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1600&auto=format&fit=crop' },
  { id: 5, img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600&auto=format&fit=crop' },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSection = useInView(0.1);
  const menuSection = useInView(0.1);
  const sigSection = useInView(0.1);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % BANNER_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[var(--cf-bg)] overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          1. HERO BANNER
      ═══════════════════════════════════════════ */}
      <section ref={heroSection.ref} className="bg-[var(--cf-secondary)]">
        <div className="relative overflow-hidden shadow-2xl aspect-video md:aspect-[22/9]">
          {BANNER_SLIDES.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={slide.img} alt={`Banner ${slide.id}`} className="w-full h-full object-cover rounded-b-3xl" />
            </div>
          ))}
          {/* Overlay text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center rounded-b-3xl">
            <div className={`text-white px-10 md:px-20 transition-all duration-1000 delay-300 ${heroSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="text-[var(--cf-accent-light)] uppercase tracking-[0.25em] text-xs md:text-sm font-semibold mb-3">Tinh hoa cà phê từ năm 2016</p>
              <h1 className="text-3xl md:text-6xl font-black leading-tight mb-4">Boutique<br />Brews</h1>
              <p className="text-white/80 text-sm md:text-lg max-w-md mb-7 leading-relaxed">Hành trình tôn vinh sự thuần khiết của cà phê — từ nông trại vùng cao đến tách cà phê trên tay bạn.</p>
              <div className="flex gap-3">
                <Link to="/menu" className="bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] text-white px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg">Xem thực đơn</Link>
                <a href="#about" className="border border-white/50 text-white hover:bg-white/20 px-6 py-3 rounded-full font-bold text-sm transition-all">Về chúng tôi</a>
              </div>
            </div>
          </div>
          <button onClick={() => setCurrentSlide(p => (p - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)} className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={() => setCurrentSlide(p => (p + 1) % BANNER_SLIDES.length)} className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {BANNER_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}/>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ABOUT */}
      <AboutPage />

      {/* ═══════════════════════════════════════════
          3. MENU SECTION
      ═══════════════════════════════════════════ */}
      <section ref={menuSection.ref} className="py-20 px-4 bg-[var(--cf-surface)]/50">
        <div className="max-w-screen-xl mx-auto">
          <div className={`transition-all duration-1000 ${menuSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="block text-center text-[var(--cf-secondary)] uppercase tracking-[0.2em] text-xs font-semibold mb-2">Khám phá</span>
            <h2 className="font-black uppercase tracking-wider text-center mb-12 text-3xl md:text-5xl text-[var(--cf-primary)]">Thực Đơn</h2>
            <div className="grid grid-cols-5 gap-8">
              {MENU_DATA.map(item => <ProductCard key={item.id} {...item} />)}
            </div>
            <div className="text-center mt-12">
              <Link to="/menu" className="inline-block px-10 py-3 border-2 border-[var(--cf-primary)] text-[var(--cf-primary)] font-bold uppercase tracking-wider rounded-full hover:bg-[var(--cf-primary)] hover:text-white transition-all duration-300">
                Xem toàn bộ thực đơn
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════
          5. SIGNATURE DRINKS
      ═══════════════════════════════════════════ */}
      <section ref={sigSection.ref} className="py-20 px-4 bg-[var(--cf-surface)]/50">
        <div className="max-w-screen-xl mx-auto">
          <div className={`transition-all duration-1000 ${sigSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="block text-center text-[var(--cf-secondary)] uppercase tracking-[0.2em] text-xs font-semibold mb-2">Đặc sản quán</span>
            <h2 className="font-black uppercase tracking-wider text-center mb-12 text-3xl md:text-5xl text-[var(--cf-primary)]">Tinh Hoa Quán</h2>
            <div className="grid grid-cols-5 gap-8">
              {SIGNATURE_DRINKS.map(item => <ProductCard key={item.id} {...item} />)}
            </div>
            <div className="text-center mt-12">
              <Link to="/menu" className="inline-block px-10 py-3 border-2 border-[var(--cf-primary)] text-[var(--cf-primary)] font-bold uppercase tracking-wider rounded-full hover:bg-[var(--cf-primary)] hover:text-white transition-all duration-300">
                Xem thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. GLOBAL PRESENCE
      ═══════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-screen-xl mx-auto">
          <span className="block text-center text-[var(--cf-secondary)] uppercase tracking-[0.2em] text-xs font-semibold mb-2">Hiện diện</span>
          <h2 className="font-black uppercase tracking-wider text-center mb-12 text-3xl md:text-5xl text-[var(--cf-primary)]">Phủ Sóng Trong Nước</h2>
          <div className="relative max-w-4xl mx-auto">
            <img src={worldMapImage} alt="Bản đồ" className="w-full grayscale sepia contrast-110 opacity-80 mix-blend-multiply" loading="lazy"/>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. STORY BANNER
      ═══════════════════════════════════════════ */}
      <section className="px-4 pb-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="relative aspect-[16/6] rounded-3xl overflow-hidden shadow-2xl border-t-8 border-[var(--cf-dark)]">
            <img src={Logo} alt="Our Story" className="w-full h-full object-cover" loading="lazy"/>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="border-2 border-white/50 px-10 py-8 md:px-24 md:py-14 bg-black/10 backdrop-blur-sm text-center">
                <h3 className="text-white font-serif font-black uppercase tracking-[0.2em] text-2xl md:text-6xl leading-tight">Boutique<br/>Brews</h3>
                <p className="text-white/70 mt-3 text-sm md:text-base uppercase tracking-widest">Since 2016</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT */}
      <ContactPage />

      {/* ═══════════════════════════════════════════
          9. CTA — SUBSCRIPTION BANNER
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-screen-xl mx-auto bg-[var(--cf-primary)] rounded-3xl overflow-hidden">
          <div className="relative px-10 py-16 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}/>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">Trải nghiệm sự khác biệt của <span className="text-[var(--cf-accent-light)]">cà phê boutique.</span></h2>
              <p className="text-white/70 mb-8 leading-relaxed">Đăng ký gói cà phê định kỳ để nhận những mẻ rang theo mùa, giao tận tay bạn mỗi tháng.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/menu" className="bg-white text-[var(--cf-primary)] px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[var(--cf-accent-light)] transition-all shadow-lg">Khám phá bộ sưu tập</Link>
                <a href="#contact" className="border border-white/40 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/15 transition-all">Liên hệ ngay</a>
              </div>
            </div>
            <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="text-4xl mb-4"><Coffee className="text-white w-8 h-8" /></div>
              <p className="text-white font-bold text-lg mb-1">Gói cà phê định kỳ</p>
              <p className="text-white/65 text-sm mb-5">Mẻ rang theo mùa × Giao tận nhà × Ưu đãi thành viên</p>
              <div className="flex gap-3">
                {['Rang nhẹ', 'Rang vừa', 'Rang đậm'].map(type => (
                  <span key={type} className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/20">{type}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;
