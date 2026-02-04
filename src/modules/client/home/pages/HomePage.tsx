import { useState, useEffect } from 'react';

const MENU_DATA = [
  { id: 1, title: 'CÀ PHÊ VIỆT NAM', img: 'https://images.unsplash.com/photo-1544787210-282dd0dc51a6?q=80&w=600&auto=format&fit=crop' },
  { id: 2, title: 'TRÀ SHAN TUYẾT CỔ THỤ', img: 'https://images.unsplash.com/photo-1594631252845-29fc458695d1?q=80&w=600&auto=format&fit=crop' },
  { id: 3, title: 'BẠC SỈU BOUTIQUE BREWS', img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop' },
  { id: 4, title: 'TRÁI CÂY TƯƠI THEO MÙA', img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=600&auto=format&fit=crop' },
  { id: 5, title: 'BÒ BÍA PHƯƠNG', img: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=600&auto=format&fit=crop' },
];

const GROCERY_DATA = [
  { id: 1, title: 'CÀ PHÊ', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop' },
  { id: 2, title: 'TRÀ CỔ THỤ', img: 'https://images.unsplash.com/photo-1563911191320-458ff6220d16?q=80&w=400&auto=format&fit=crop' },
  { id: 3, title: 'SET QUÀ TẶNG', img: 'https://images.unsplash.com/photo-1549462111-80a2b988c838?q=80&w=400&auto=format&fit=crop' },
  { id: 4, title: 'QUÀ LƯU NIỆM', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop' },
  { id: 5, title: 'KHÁC', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400&auto=format&fit=crop' },
];

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
      <section className="bg-[var(--cf-secondary)] px-4 py-6 md:px-10 md:py-8">
        <div className="max-w-screen-xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl aspect-video md:aspect-[21/9]">
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
                className="w-full h-full object-cover"
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
        <h2 className="font-serif font-black uppercase tracking-[0.2em] text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Thực Đơn
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {MENU_DATA.map((item) => (
            <div 
              key={item.id} 
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <div className="aspect-square rounded-3xl overflow-hidden border-4 border-transparent hover:border-[var(--cf-primary)] transition-all duration-300 bg-[var(--cf-surface)]">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
              </div>
              <p className="mt-4 text-center font-bold text-xs md:text-sm uppercase tracking-tight md:tracking-normal leading-tight text-[var(--cf-primary)]">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. GLOBAL PRESENCE */}
      <section className="bg-[var(--cf-surface)] py-20 px-4 border-t border-[var(--cf-secondary)]">
        <h2 className="font-serif font-black uppercase tracking-[0.2em] text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Quốc Tế
        </h2>
        <div className="max-w-4xl mx-auto relative">
          <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000&auto=format&fit=crop" 
            alt="World Map" 
            className="w-full grayscale sepia contrast-110 opacity-80 mix-blend-multiply"
            loading="lazy"
          />
          {/* Map Markers */}
          <div className="absolute top-[22%] left-[72%] bg-[var(--cf-primary)] text-white text-[10px] px-2 py-1 rounded shadow-md -translate-x-1/2 whitespace-nowrap font-semibold">
            VIETNAM
          </div>
          <div className="absolute top-[35%] left-[48%] bg-[var(--cf-primary)] text-white text-[10px] px-2 py-1 rounded shadow-md -translate-x-1/2 whitespace-nowrap font-semibold">
            LONDON
          </div>
          <div className="absolute top-[30%] left-[80%] bg-[var(--cf-primary)] text-white text-[10px] px-2 py-1 rounded shadow-md -translate-x-1/2 whitespace-nowrap font-semibold">
            CANTON
          </div>
          <div className="absolute top-[25%] left-[85%] bg-[var(--cf-primary)] text-white text-[10px] px-2 py-1 rounded shadow-md -translate-x-1/2 whitespace-nowrap font-semibold">
            TAIPEI
          </div>
          <div className="absolute top-[75%] left-[88%] bg-[var(--cf-primary)] text-white text-[10px] px-2 py-1 rounded shadow-md -translate-x-1/2 whitespace-nowrap font-semibold">
            SYDNEY
          </div>
          <div className="absolute top-[45%] left-[92%] bg-[var(--cf-primary)] text-white text-[10px] px-2 py-1 rounded shadow-md -translate-x-1/2 whitespace-nowrap font-semibold">
            TO BE CONTINUED...
          </div>
        </div>
      </section>

      {/* 4. GROCERY SECTION */}
      <section className="py-16 px-4 max-w-screen-xl mx-auto">
        <h2 className="font-serif font-black uppercase tracking-[0.2em] text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Tạp Hoá
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {GROCERY_DATA.map((item) => (
            <div key={item.id} className="cursor-pointer">
              <div className="aspect-[4/5] bg-white rounded-xl p-4 flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-4/5 object-contain"
                  loading="lazy"
                />
              </div>
              <p className="mt-4 text-center font-bold text-sm uppercase tracking-wider text-[var(--cf-primary)]">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STORY SECTION */}
      <section className="px-4 pb-20 max-w-screen-xl mx-auto">
        <h2 className="font-serif font-black uppercase tracking-[0.2em] text-center mb-10 md:mb-16 text-3xl md:text-5xl text-[var(--cf-primary)]">
          Câu Chuyện Boutique Brews
        </h2>
        <div className="relative aspect-video md:aspect-[21/7] rounded-3xl overflow-hidden shadow-2xl border-t-8 border-[var(--cf-dark)]">
          <img 
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1600&auto=format&fit=crop" 
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