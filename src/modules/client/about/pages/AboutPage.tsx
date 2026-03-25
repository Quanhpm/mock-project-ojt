import { useState, useEffect, useRef } from 'react';
import { Leaf, Coffee, HeartHandshake, Sparkles } from "lucide-react";

const BRAND_DNA = [
  { label: 'Bền vững', title: 'Thu mua bền vững', icon: <Leaf className="text-[var(--cf-primary)] w-6 h-6" />, desc: 'Hợp tác trực tiếp với nông hộ nhằm đảm bảo thu nhập công bằng và phương thức canh tác thân thiện môi trường.' },
  { label: 'Chính xác', title: 'Nghệ thuật rang xay', icon: <Coffee className="text-[var(--cf-primary)] w-6 h-6" />, desc: 'Rang mẻ nhỏ với độ chính xác cao, khai mở trọn vẹn hương vị riêng biệt của từng vùng cà phê.' },
  { label: 'Cộng đồng', title: 'Kết nối cộng đồng', icon: <HeartHandshake className="text-[var(--cf-primary)] w-6 h-6" />, desc: 'Không gian quán được thiết kế như nơi gặp gỡ, sáng tạo và sẻ chia của những tâm hồn yêu cà phê.' },
  { label: 'Thuần khiết', title: 'Chất lượng thuần khiết', icon: <Sparkles className="text-[var(--cf-primary)] w-6 h-6" />, desc: 'Không phụ gia, không thỏa hiệp. Chỉ có cà phê hảo hạng và nước tinh khiết, cân bằng hoàn hảo.' },
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

function AboutPage() {
  const aboutSection = useInView(0.1);
  const journeySection = useInView(0.1);

  return (
    <div>
      {/* ABOUT + BRAND DNA */}
      <section id="about" ref={aboutSection.ref} className="py-12 md:py-24 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-14 md:mb-24 transition-all duration-1000 ${aboutSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="hidden md:block">
              <span className="text-[var(--cf-secondary)] uppercase tracking-[0.2em] text-xs font-semibold block mb-3">Về chúng tôi</span>
              <h2 className="text-3xl md:text-5xl font-black text-[var(--cf-primary)] leading-tight mb-5 md:mb-6">
                Về <span className="text-[var(--cf-secondary)]">Boutique Brews</span>
              </h2>
              <p className="text-[var(--cf-primary)]/75 text-base md:text-lg leading-relaxed mb-5">
                Khởi nguồn từ một xưởng rang nhỏ nơi góc phố yên tĩnh, Boutique Brews dần trở thành hành trình tôn vinh sự thuần khiết của cà phê.
                Chúng tôi tin rằng mỗi tách cà phê mang theo câu chuyện của thổ nhưỡng, độ cao và những con người đã nâng niu từng hạt cà phê.
              </p>
              <div className="flex items-center justify-between sm:justify-start sm:gap-8 mt-7 md:mt-8">
                {[['8+', 'Năm kinh nghiệm'], ['50+', 'Loại cà phê'], ['10k+', 'Khách hàng']].map(([num, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl md:text-3xl font-black text-[var(--cf-primary)]">{num}</p>
                    <p className="text-xs text-[var(--cf-secondary)] uppercase tracking-wide font-semibold mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvwMdrPsSqtWpdi8falAXTWTbcvCiPPBrCbW1g2YXY_iPbXzQQGQlj3nIoyu8a2Kn4K9NL7O3878LMPBtl-tsTdk2mRe8mUe1Atr224aUBp19_Bcdx4lX54Y6mrSCPdwc69wb776jTN6QSx47FUol0X4OqyTKNDGNkT2FAeFQBnscwgQlD5eC-Avx_XZFrBuLGtQFJ4n94D0Sf5wUbqPyccszaSZBSHr5NE1Fes4PwyQCodUOd49-EcIbjFQTmwGCujJ5_Z0wR2OM"
                alt="Boutique Brews"
              />
              <div className="absolute -bottom-4 -left-1 md:-bottom-5 md:-left-5 bg-[var(--cf-primary)] text-white px-5 py-3 md:px-6 md:py-4 rounded-xl shadow-xl">
                <p className="text-xl md:text-2xl font-black">2016</p>
                <p className="text-xs uppercase tracking-wide text-white/70">Năm thành lập</p>
              </div>
            </div>
          </div>

          <div className={`hidden md:block transition-all duration-1000 delay-200 ${aboutSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-center text-2xl md:text-3xl font-black text-[var(--cf-primary)] uppercase tracking-wider mb-8 md:mb-10">Nền tảng tạo nên Boutique Brews</h3>
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 px-1 -mx-1">
              {BRAND_DNA.map(item => (
                <div key={item.title} className="min-w-[82%] sm:min-w-0 snap-center group bg-white/60 hover:bg-white/90 border border-[var(--cf-secondary)]/20 hover:border-[var(--cf-secondary)]/50 p-6 md:p-7 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                  <span className="text-3xl mb-4 block">{item.icon}</span>
                  <span className="text-[var(--cf-secondary)] text-[10px] uppercase tracking-widest font-bold block mb-2">{item.label}</span>
                  <h4 className="text-[var(--cf-primary)] font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-[var(--cf-primary)]/65 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section ref={journeySection.ref} className="py-12 md:py-24 px-4">
        <div className={`max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-1000 ${journeySection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <img
              className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7j7BbRcC4xqHek7AH1I1TbiHuWHWbedRsL_vECe2gw0ibTOY8x3-2Mn2S8Zgy15lPqIBUOwWRs11SuJemk-K99n1okD1y33f2T1go-6_BAWv4PLNV1TgIJbrNI4pKvlCcrC8dVFEykv2r1vFZ4tvUMnXXs1Of1Ah0QhwD_83JkUIR2txqSv1Ds6rNKfNS0Pb7yqe42LzC40KJFLVz1Pa4pYVtEAx7g0sdSz74UKZt4ppAM_HS-Qs8eTwvHX053NR4S93_evT42fM"
              alt="Coffee Journey"
            />
            <div className="absolute top-5 right-5 bg-white p-5 rounded-xl shadow-xl text-center">
              <p className="text-3xl font-black text-[var(--cf-primary)]">1500m</p>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--cf-secondary)] mt-1">Độ cao trang trại</p>
            </div>
          </div>
          <div>
            <span className="text-[var(--cf-secondary)] uppercase tracking-[0.2em] text-xs font-semibold block mb-3">Hành trình chúng tôi</span>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--cf-primary)] mb-5 md:mb-6 leading-tight">
              Từ nông trại vùng cao <br/>đến tách cà phê mỗi sáng
            </h2>
            <p className="text-[var(--cf-primary)]/75 leading-relaxed mb-7 md:mb-8 text-base md:text-lg">
              Hành trình của chúng tôi bắt đầu ở độ cao hơn 1.500 mét. Boutique Brews trực tiếp ghé thăm
              các nông trại hai lần mỗi năm để đảm bảo từng vụ thu hoạch đạt tiêu chuẩn khắt khe nhất.
            </p>
            <ul className="space-y-3">
              {['Thu hái thủ công những trái chín hoàn hảo', 'Cơ sở rang trung hòa carbon', 'Bao bì phân hủy sinh học 100%', 'Đào tạo barista chuyên sâu theo tiêu chuẩn quốc tế'].map(item => (
                <li key={item} className="flex items-start gap-3 text-[var(--cf-primary)]/80">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--cf-secondary)]/20 flex items-center justify-center shrink-0 text-[var(--cf-primary)] text-xs font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;