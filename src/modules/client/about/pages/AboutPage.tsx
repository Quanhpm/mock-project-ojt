function AboutPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-primary dark:text-gray-100 font-sans tracking-normal transition-colors duration-300">
      <main>
        {/* HERO */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 hero-gradient"></div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <span className="text-accent font-medium uppercase tracking-wide text-xs mb-4 block">
                Tinh hoa cà phê từ năm 2016
              </span>

              <h1 className="font-display tracking-tight text-5xl lg:text-7xl leading-tight mb-8">
                Về Boutique Brews
              </h1>

              <p className="text-lg lg:text-xl text-primary/80 dark:text-gray-400 mb-10 leading-relaxed max-w-xl">
                Khởi nguồn từ một xưởng rang nhỏ nơi góc phố yên tĩnh, Boutique Brews dần trở thành hành trình
                tôn vinh sự thuần khiết của cà phê. Chúng tôi tin rằng mỗi tách cà phê đều mang theo câu chuyện
                của thổ nhưỡng, độ cao và những con người đã nâng niu từng hạt cà phê.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="bg-primary text-white dark:bg-accent dark:text-primary px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-all flex items-center">
                  Khám phá bộ sưu tập
                  <span className="material-icons-outlined ml-2 text-sm leading-none">
                    "CAFE Ủ LẠNH"
                  </span>
                </button>

                <button className="border-2 border-primary/20 dark:border-white/20 px-8 py-4 rounded-full font-semibold hover:border-primary dark:hover:border-accent transition-all">
                  Xem thực đơn
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                <img
                  alt="Không gian quán cà phê cao cấp"
                  className="w-full h-[600px] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvwMdrPsSqtWpdi8falAXTWTbcvCiPPBrCbW1g2YXY_iPbXzQQGQlj3nIoyu8a2Kn4K9NL7O3878LMPBtl-tsTdk2mRe8mUe1Atr224aUBp19_Bcdx4lX54Y6mrSCPdwc69wb776jTN6QSx47FUol0X4OqyTKNDGNkT2FAeFQBnscwgQlD5eC-Avx_XZFrBuLGtQFJ4n94D0Sf5wUbqPyccszaSZBSHr5NE1Fes4PwyQCodUOd49-EcIbjFQTmwGCujJ5_Z0wR2OM"
                />

                <div className="absolute top-8 right-8 bg-white/90 dark:bg-primary/90 backdrop-blur p-6 rounded-xl shadow-lg text-center border border-accent/20">
                  <p className="font-display text-accent text-4xl leading-none">8+</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide mt-1">
                    Năm theo đuổi chất lượng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BRAND DNA */}
        <section className="py-20 bg-white/50 dark:bg-black/20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <span className="text-accent font-medium uppercase tracking-wide text-xs mb-4 block">
              Bản sắc thương hiệu
            </span>

            <h2 className="font-display tracking-tight text-4xl mb-16">
              Nền tảng tạo nên Boutique Brews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: 'Thân thiện',
                  title: 'Thu mua bền vững',
                  desc:
                    'Hợp tác trực tiếp với nông hộ nhằm đảm bảo thu nhập công bằng và phương thức canh tác thân thiện với môi trường.',
                },
                {
                  icon: 'Sản xuất chính xác',
                  title: 'Nghệ thuật rang xay',
                  desc:
                    'Rang mẻ nhỏ với độ chính xác cao, khai mở trọn vẹn hương vị riêng biệt của từng vùng cà phê.',
                },
                {
                  icon: 'Đa dạng',
                  title: 'Kết nối cộng đồng',
                  desc:
                    'Không gian quán được thiết kế như nơi gặp gỡ, sáng tạo và sẻ chia của những tâm hồn yêu cà phê.',
                },
                {
                  icon: 'Chất lượng',
                  title: 'Chất lượng thuần khiết',
                  desc:
                    'Không phụ gia, không thỏa hiệp. Chỉ có cà phê hảo hạng và nước tinh khiết, cân bằng hoàn hảo.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-10 bg-background-light dark:bg-background-dark rounded-xl dark:border-white/5 hover:shadow-xl transition-all"
                >
                  <span className="material-icons-outlined text-4xl text-accent mb-6 inline-block leading-none">
                    {item.icon}
                  </span>
                  <h3 className="font-display text-xl tracking-normal mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-primary/70 dark:text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
