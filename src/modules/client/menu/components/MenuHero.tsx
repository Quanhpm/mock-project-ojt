function MenuHero() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[var(--cf-primary)]/15 bg-[linear-gradient(145deg,#fdf8f1_0%,#f7efe3_58%,#f3e7d8_100%)] p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)] md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--cf-accent-light)]/35 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 left-24 h-72 w-72 rounded-full bg-[var(--cf-primary)]/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-5 md:max-w-3xl">
          <p className="w-fit rounded-full border border-[var(--cf-primary)]/20 bg-white/65 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cf-primary)]">
            Không gian thưởng thức hiện đại
          </p>
          <h1 className="text-4xl font-black leading-[1.35] text-[var(--cf-dark)] md:text-6xl">
            Thực đơn tuyển chọn
            <span className="block text-2xl font-semibold italic text-[var(--cf-secondary)] md:text-4xl">
              Tinh túy cho mọi cảm hứng
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--cf-secondary)] md:text-lg">
            Khám phá bộ sưu tập đồ uống và món ăn được chọn lọc kỹ, nơi mỗi sản phẩm đều
            được thiết kế để tạo ra trải nghiệm vị giác cao cấp và đồng nhất.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MenuHero;
