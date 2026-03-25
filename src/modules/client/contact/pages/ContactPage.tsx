import { useState, useEffect, useRef } from 'react';
import { MapPin, Mail, Phone} from "lucide-react";

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

function ContactPage() {
  const contactSection = useInView(0.1);
  return (
    <>
      {/* CONTACT */}
      <section id="contact" ref={contactSection.ref} className="py-12 md:py-24 px-4 bg-white/50">
        <div className="max-w-screen-xl mx-auto">
          <div className={`text-center mb-10 md:mb-16 transition-all duration-1000 ${contactSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="text-[var(--cf-secondary)] uppercase tracking-[0.2em] text-xs font-semibold block mb-3">Liên hệ</span>
            <h2 className="text-3xl md:text-5xl font-black text-[var(--cf-primary)] mb-4">Cùng Nhau Tạo Nên <span className="text-[var(--cf-secondary)]">Giá Trị</span></h2>
            <p className="text-[var(--cf-primary)]/70 text-sm md:text-base max-w-xl mx-auto leading-relaxed">Bạn có câu hỏi, ý tưởng mới hoặc đang tìm kiếm một đối tác đáng tin cậy? Đội ngũ của chúng tôi luôn sẵn sàng lắng nghe.</p>
          </div>

          <div className="hidden">
            {[
              { icon: <MapPin className="text-[var(--cf-primary)] w-6 h-6" />, title: 'Văn phòng làm việc', lines: ['123 Business Plaza, Tầng 5', 'New York, NY 10001'] },
              { icon: <Mail className="text-[var(--cf-primary)] w-6 h-6" />, title: 'Email liên hệ', lines: ['hello@boutiquebrews.com', 'support@boutiquebrews.com'] },
              { icon: <Phone className="text-[var(--cf-primary)] w-6 h-6" />, title: 'Hotline', lines: ['+1 (555) 123-4567', 'Thứ 2 – Thứ 6, 9:00 – 18:00'] },
            ].map(card => (
              <div key={card.title} className="min-w-[82%] md:min-w-0 snap-center flex flex-col gap-4 rounded-2xl border border-[var(--cf-secondary)]/25 bg-[var(--cf-bg)] p-6 md:p-8 shadow-sm hover:shadow-lg hover:border-[var(--cf-secondary)]/50 transition-all duration-300">
                <div className="text-3xl">{card.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--cf-primary)] mb-2">{card.title}</h3>
                  {card.lines.map(l => <p key={l} className="text-[var(--cf-primary)]/65 text-sm">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start transition-all duration-1000 delay-300 ${contactSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[var(--cf-primary)] mb-2">Gửi tin nhắn cho chúng tôi</h3>
              <p className="text-[var(--cf-primary)]/65 text-sm mb-6 md:mb-8">Điền đầy đủ thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
              <form className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-[var(--cf-primary)] uppercase tracking-wide">Họ và tên</span>
                    <input type="text" placeholder="Nguyễn Văn A" className="w-full rounded-xl border border-[var(--cf-secondary)]/35 bg-white px-4 py-3 text-[var(--cf-primary)] text-sm focus:ring-2 focus:ring-[var(--cf-secondary)]/40 focus:border-[var(--cf-primary)] outline-none transition-all"/>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-[var(--cf-primary)] uppercase tracking-wide">Email</span>
                    <input type="email" placeholder="email@example.com" className="w-full rounded-xl border border-[var(--cf-secondary)]/35 bg-white px-4 py-3 text-[var(--cf-primary)] text-sm focus:ring-2 focus:ring-[var(--cf-secondary)]/40 focus:border-[var(--cf-primary)] outline-none transition-all"/>
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--cf-primary)] uppercase tracking-wide">Chủ đề</span>
                  <input type="text" placeholder="Tư vấn dự án / Hợp tác" className="w-full rounded-xl border border-[var(--cf-secondary)]/35 bg-white px-4 py-3 text-[var(--cf-primary)] text-sm focus:ring-2 focus:ring-[var(--cf-secondary)]/40 focus:border-[var(--cf-primary)] outline-none transition-all"/>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--cf-primary)] uppercase tracking-wide">Nội dung</span>
                  <textarea rows={5} placeholder="Hãy chia sẻ chi tiết nhu cầu hoặc ý tưởng của bạn..." className="w-full rounded-xl border border-[var(--cf-secondary)]/35 bg-white px-4 py-3 text-[var(--cf-primary)] text-sm focus:ring-2 focus:ring-[var(--cf-secondary)]/40 focus:border-[var(--cf-primary)] outline-none transition-all resize-none"/>
                </label>
                <button type="submit" className="w-full py-3.5 md:py-4 bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] text-white font-bold rounded-xl text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 md:active:scale-100">
                  Gửi tin nhắn
                </button>
              </form>
            </div>

            <div className="hidden md:flex flex-col gap-6">
              <div
                className="w-full aspect-[3/4] md:aspect-[4/3] rounded-2xl shadow-xl bg-center bg-no-repeat bg-cover"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCuDWIzTC1-FygaBMtIMjuX_AdHVI_KAE1TIoRcTpUvCVUtaoBPSm22q_R3C3gvSRm679G-MwbXxfhDVCutaKwcZK9L3N8iFjU0f3KDR53q8Z8t60QsI9UoOGdUndBL3467SQBkxMN5JSPJ6uGAuPfng32mZLR5SDAeMqFhg2UvqWkndOk1GImtBWt1kjKPAarZ3PKkaYHinQwwwDr_NZRmu1aXhokrO9F0qaeAO4M05_Pi-MU--Q08-rQ7KMfXRjcGAphJD-5qskTU")' }}
              />
              <div className="bg-[var(--cf-primary)] text-white p-6 md:p-8 rounded-2xl">
                <p className="italic text-white/90 leading-relaxed mb-5">"Chưa từng trải nghiệm profile rang nào tinh tế đến vậy. Mỗi tách cà phê là một chuyến hành trình."</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">J</div>
                  <div>
                    <p className="font-bold text-sm">James Dalton</p>
                    <p className="text-[10px] uppercase tracking-wide text-white/60">Nhà phê bình cà phê</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
