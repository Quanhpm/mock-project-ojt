import LOGO from '@/assets/img/logobb.png';

interface OrderHeroProps {
  onContinueShopping: () => void;
}

function OrderHero({ onContinueShopping }: OrderHeroProps) {
  return (
    <section className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
      <div className="flex-1 space-y-6 text-center lg:text-left">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
            Tài khoản của tôi
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-[#161413]">
            Lịch Sử <span className="text-primary">Đơn Hàng</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto lg:mx-0">
            Theo dõi những hương vị bạn đã khám phá cùng Boutique Brews. Xem lại các sản phẩm yêu thích và quản lý việc vận chuyển.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
          <button
            onClick={onContinueShopping}
            className="flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer border-2 border-primary"
          >
            Tiếp tục mua sắm
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
      <div className="hidden lg:block flex-1 w-full max-w-lg lg:max-w-none">
        <div className="relative group">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-primary/30 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl border border-zinc-200 bg-white">
            <img alt="BOUTIQUE BREWS Logo" className="h-full w-full object-contain p-8" src={LOGO} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderHero;
