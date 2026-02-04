function AboutPage() {
  return (
    <div className="bg-background-light text-primary font-sans tracking-normal">
      <main>
        {/* ================= HERO ================= */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-accent uppercase tracking-wide text-xs font-medium block mb-4">
                Tinh hoa cà phê từ năm 2016
              </span>

              <h1 className="font-display text-5xl lg:text-7xl tracking-tight mb-8">
                Về Boutique Brews
              </h1>

              <p className="text-lg text-primary/80 leading-relaxed max-w-xl mb-10">
                Khởi nguồn từ một xưởng rang nhỏ nơi góc phố yên tĩnh, Boutique Brews dần trở thành hành trình
                tôn vinh sự thuần khiết của cà phê. Chúng tôi tin rằng mỗi tách cà phê đều mang theo câu chuyện
                của thổ nhưỡng, độ cao và những con người đã nâng niu từng hạt cà phê.
              </p>

              <div className="flex gap-4">
                <button className="bg-primary text-white px-8 py-4 rounded-full font-semibold">
                  Khám phá bộ sưu tập
                </button>
                <button className="border border-primary/30 px-8 py-4 rounded-full font-semibold">
                  Xem thực đơn
                </button>
              </div>
            </div>

            <div className="relative">
              <img
                className="rounded-xl shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvwMdrPsSqtWpdi8falAXTWTbcvCiPPBrCbW1g2YXY_iPbXzQQGQlj3nIoyu8a2Kn4K9NL7O3878LMPBtl-tsTdk2mRe8mUe1Atr224aUBp19_Bcdx4lX54Y6mrSCPdwc69wb776jTN6QSx47FUol0X4OqyTKNDGNkT2FAeFQBnscwgQlD5eC-Avx_XZFrBuLGtQFJ4n94D0Sf5wUbqPyccszaSZBSHr5NE1Fes4PwyQCodUOd49-EcIbjFQTmwGCujJ5_Z0wR2OM"
                alt=""
              />

              <div className="absolute top-6 right-6 bg-white px-5 py-3 rounded-lg text-center shadow">
                <p className="font-display text-3xl text-accent">8+</p>
                <p className="text-[10px] uppercase tracking-wide font-semibold">
                  Năm theo đuổi chất lượng
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BRAND DNA ================= */}
        <section className="py-20 bg-white/60">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <span className="text-accent uppercase tracking-wide text-xs font-medium block mb-4">
              Bản sắc thương hiệu
            </span>

            <h2 className="font-display text-4xl tracking-tight mb-16">
              Nền tảng tạo nên Boutique Brews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  label: 'Bền vững',
                  title: 'Thu mua bền vững',
                  desc:
                    'Hợp tác trực tiếp với nông hộ nhằm đảm bảo thu nhập công bằng và phương thức canh tác thân thiện với môi trường.',
                },
                {
                  label: 'Chính xác',
                  title: 'Nghệ thuật rang xay',
                  desc:
                    'Rang mẻ nhỏ với độ chính xác cao, khai mở trọn vẹn hương vị riêng biệt của từng vùng cà phê.',
                },
                {
                  label: 'Cộng đồng',
                  title: 'Kết nối cộng đồng',
                  desc:
                    'Không gian quán được thiết kế như nơi gặp gỡ, sáng tạo và sẻ chia của những tâm hồn yêu cà phê.',
                },
                {
                  label: 'Thuần khiết',
                  title: 'Chất lượng thuần khiết',
                  desc:
                    'Không phụ gia, không thỏa hiệp. Chỉ có cà phê hảo hạng và nước tinh khiết, cân bằng hoàn hảo.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-background-light p-8 rounded-xl border border-primary/10"
                >
                  <span className="text-accent text-xs uppercase tracking-wide font-semibold block mb-3">
                    {item.label}
                  </span>
                  <h3 className="font-display text-xl mb-3">{item.title}</h3>
                  <p className="text-sm text-primary/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= JOURNEY ================= */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <img
              className="rounded-xl shadow-xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7j7BbRcC4xqHek7AH1I1TbiHuWHWbedRsL_vECe2gw0ibTOY8x3-2Mn2S8Zgy15lPqIBUOwWRs11SuJemk-K99n1okD1y33f2T1go-6_BAWv4PLNV1TgIJbrNI4pKvlCcrC8dVFEykv2r1vFZ4tvUMnXXs1Of1Ah0QhwD_83JkUIR2txqSv1Ds6rNKfNS0Pb7yqe42LzC40KJFLVz1Pa4pYVtEAx7g0sdSz74UKZt4ppAM_HS-Qs8eTwvHX053NR4S93_evT42fM"
              alt=""
            />

            <div>
              <h2 className="font-display text-4xl mb-6">
                Từ nông trại vùng cao đến tách cà phê mỗi sáng
              </h2>

              <p className="text-primary/80 mb-6 leading-relaxed">
                Hành trình của chúng tôi bắt đầu ở độ cao hơn 1.500 mét. Boutique Brews trực tiếp ghé thăm
                các nông trại hai lần mỗi năm để đảm bảo từng vụ thu hoạch đạt tiêu chuẩn khắt khe.
              </p>

              <ul className="space-y-3 text-sm">
                <li>✔ Thu hái thủ công những trái chín hoàn hảo</li>
                <li>✔ Cơ sở rang trung hòa carbon</li>
                <li>✔ Bao bì phân hủy sinh học</li>
                <li>✔ Đào tạo barista chuyên sâu</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto bg-primary rounded-3xl p-16 text-white grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-4xl mb-6">
                Trải nghiệm sự khác biệt của cà phê boutique.
              </h2>
              <p className="text-white/70 mb-8">
                Đăng ký gói cà phê định kỳ để nhận những mẻ rang theo mùa,
                giao tận tay bạn mỗi tháng.
              </p>

              <div className="flex gap-4">
                <button className="bg-white text-primary px-8 py-4 rounded-full font-semibold">
                  Bắt đầu đăng ký
                </button>
                <button className="border border-white/40 px-8 py-4 rounded-full font-semibold">
                  Tìm cửa hàng
                </button>
              </div>
            </div>

            <div className="bg-white/10 p-8 rounded-2xl">
              <p className="italic text-lg mb-4">
                “Chưa từng trải nghiệm profile rang nào tinh tế đến vậy.
                Mỗi tách cà phê là một chuyến hành trình.”
              </p>
              <p className="font-semibold">James Dalton</p>
              <p className="text-xs uppercase tracking-wide text-white/60">
                Nhà phê bình cà phê
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
