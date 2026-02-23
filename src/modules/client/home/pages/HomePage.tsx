import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import products from '@/mockdata/products.json';
import worldMapImage from '@/assets/img/anh-home-page.png';
import Logo from '@/assets/img/logobb.png';
import ProductCard from '../components/ProductCard';

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

// Lấy 5 sản phẩm nổi bật cho menu (món ăn)
const MENU_DATA = (products as Product[])
  .filter(p => p.is_active && !p.is_deleted && p.category_id === 3)
  .slice(0, 5)
  .map(p => ({
    id: p.id,
    name: p.name,
    title: p.name.toUpperCase(),
    img: p.image_url
  }));

// Lấy 5 signature drinks (đồ uống đặc biệt)
const SIGNATURE_DRINKS = (products as Product[])
  .filter(p => p.is_active && !p.is_deleted && [1, 2].includes(p.category_id))
  .sort((a, b) => b.max_price - a.max_price)
  .slice(0, 5)
  .map(p => ({
    id: p.id,
    name: p.name,
    title: p.name.toUpperCase(),
    img: p.image_url
  }));

const BANNER_SLIDES = [
  { id: 1, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop' },
  { id: 2, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600&auto=format&fit=crop' },
  { id: 3, img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1600&auto=format&fit=crop' },
  { id: 4, img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1600&auto=format&fit=crop' },
  { id: 5, img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600&auto=format&fit=crop' },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[var(--cf-bg)] overflow-x-hidden">
      {/* 1. HERO BANNER */}
      <section className="bg-[var(--cf-secondary)]">
        <div className="relative overflow-hidden shadow-2xl aspect-video md:aspect-[22/9]">
          {/* Slides */}
          {BANNER_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={slide.img} 
                alt={`Banner ${slide.id}`}
                className="w-full h-full object-cover rounded-b-3xl"
              />
            </div>
          ))}

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300"
            aria-label="Previous Banner"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300"
            aria-label="Next Banner"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {BANNER_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-4 bg-white' 
                    : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. MENU SECTION */}
      <section className="py-16 px-4 max-w-screen-xl mx-auto">
        <h2 className="font-black uppercase tracking-wider text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Thực Đơn
        </h2>
        <div className="grid grid-cols-5 gap-8">
          {MENU_DATA.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/menu"
            className="inline-block px-8 py-3 border-2 border-[var(--cf-primary)] text-[var(--cf-primary)] font-bold uppercase tracking-wider rounded-full hover:bg-[var(--cf-primary)] hover:text-white transition-all duration-300"
          >
            Xem thêm
          </Link>
        </div>
      </section>

      {/* 3. GLOBAL PRESENCE */}
      <section className="bg-[var(--cf-surface)] py-20 px-4 border-t border-[var(--cf-secondary)]">
        <h2 className="font-black uppercase tracking-wider text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Phủ Sóng Trong Nước 
        </h2>
        <div className="max-w-4xl mx-auto relative">
          <img 
            src={worldMapImage}
            alt="World Map" 
            className="w-full grayscale sepia contrast-110 opacity-80 mix-blend-multiply"
            loading="lazy"
          />
        </div>
      </section>

      {/* 4. SIGNATURE DRINKS SECTION */}
      <section className="py-16 px-4 max-w-screen-xl mx-auto">
        <h2 className="font-black uppercase tracking-wider text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Tinh Hoa Quán
        </h2>
        <div className="grid grid-cols-5 gap-8">
          {SIGNATURE_DRINKS.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/menu"
            className="inline-block px-8 py-3 border-2 border-[var(--cf-primary)] text-[var(--cf-primary)] font-bold uppercase tracking-wider rounded-full hover:bg-[var(--cf-primary)] hover:text-white transition-all duration-300"
          >
            Xem thêm
          </Link>
        </div>
      </section>

      {/* 5. STORY SECTION */}
      <section className="px-4 pb-20 max-w-screen-xl mx-auto">
        <h2 className="font-black uppercase tracking-wider text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Câu Chuyện Boutique Brews
        </h2>
        <div className="relative aspect-video md:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-t-8 border-[var(--cf-dark)]">
          <img 
            src={Logo}  
            alt="Our Story" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <div className="border-2 border-white/50 px-8 py-6 md:px-20 md:py-12 bg-black/10 backdrop-blur-sm text-center">
              <h3 className="text-white font-serif font-black uppercase tracking-[0.2em] text-2xl md:text-6xl leading-tight">
                Boutique<br/>Brews
              </h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;