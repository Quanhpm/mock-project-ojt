function ContactPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="w-full max-w-[1200px] mx-auto px-4 md:px-10 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-primary dark:text-white">
                Cùng Nhau Tạo Nên <span className="text-[#B08968]">Giá Trị Tuyệt Vời</span>
              </h1>
              <p className="text-lg text-[#7F5539]/80 dark:text-gray-400 max-w-lg leading-relaxed">
                Bạn có câu hỏi, ý tưởng mới hoặc đang tìm kiếm một đối tác đáng tin cậy?
                Đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn
                để biến ý tưởng thành những giải pháp hiệu quả và thực tế.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary text-white font-bold text-base shadow-lg hover:bg-[#9C6644] transition-all">
                Gửi liên hệ
              </button>
              <button className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-surface-light text-primary font-bold text-base border border-[#B08968] hover:bg-accent-light transition-all">
                Câu hỏi thường gặp
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div
              className="w-full aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-2xl shadow-2xl"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCuDWIzTC1-FygaBMtIMjuX_AdHVI_KAE1TIoRcTpUvCVUtaoBPSm22q_R3C3gvSRm679G-MwbXxfhDVCutaKwcZK9L3N8iFjU0f3KDR53q8Z8t60QsI9UoOGdUndBL3467SQBkxMN5JSPJ6uGAuPfng32mZLR5SDAeMqFhg2UvqWkndOk1GImtBWt1kjKPAarZ3PKkaYHinQwwwDr_NZRmu1aXhokrO9F0qaeAO4M05_Pi-MU--Q08-rQ7KMfXRjcGAphJD-5qskTU")',
              }}
            />
          </div>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="w-full max-w-[1200px] mx-auto px-4 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#B08968]/30 bg-surface-light p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center size-12 rounded-xl bg-accent-light text-primary">
              <span className="material-icons-outlined">map</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-primary">Văn phòng làm việc</h3>
              <p className="text-[#7F5539]/70">
                123 Business Plaza, Tầng 5
                <br />
                New York, NY 10001
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-[#B08968]/30 bg-surface-light p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center size-12 rounded-xl bg-accent-light text-primary">
              <span className="material-icons-outlined">mail</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-primary">Email liên hệ</h3>
              <p className="text-[#7F5539]/70">
                hello@corporatebrand.com
                <br />
                support@corporatebrand.com
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-[#B08968]/30 bg-surface-light p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center size-12 rounded-xl bg-accent-light text-primary">
              <span className="material-icons-outlined">call</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-primary">Hotline</h3>
              <p className="text-[#7F5539]/70">
                +1 (555) 123-4567
                <br />
                Thứ 2 – Thứ 6, 9:00 – 18:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="w-full max-w-[800px] mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Gửi tin nhắn cho chúng tôi
          </h2>
          <p className="text-[#7F5539]/70">
            Vui lòng điền đầy đủ thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ.
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-primary">
                Họ và tên
              </span>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full rounded-lg border border-[#B08968]/40 bg-white p-4 text-primary focus:ring-2 focus:ring-[#B08968]/50 focus:border-primary outline-none transition-all"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-primary">
                Email
              </span>
              <input
                type="email"
                placeholder="emailcuaban@example.com"
                className="w-full rounded-lg border border-[#B08968]/40 bg-white p-4 text-primary focus:ring-2 focus:ring-[#B08968]/50 focus:border-primary outline-none transition-all"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-primary">
              Chủ đề
            </span>
            <input
              type="text"
              placeholder="Tư vấn dự án / Hợp tác"
              className="w-full rounded-lg border border-[#B08968]/40 bg-white p-4 text-primary focus:ring-2 focus:ring-[#B08968]/50 focus:border-primary outline-none transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-primary">
              Nội dung
            </span>
            <textarea
              rows={6}
              placeholder="Hãy chia sẻ chi tiết nhu cầu hoặc ý tưởng của bạn..."
              className="w-full rounded-lg border border-[#B08968]/40 bg-white p-4 text-primary focus:ring-2 focus:ring-[#B08968]/50 focus:border-primary outline-none transition-all resize-none"
            />
          </label>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-bold rounded-lg text-lg hover:bg-[#9C6644] transition-all shadow-lg"
          >
            Gửi tin nhắn
          </button>
        </form>
      </section>

      {/* MAP SECTION */}
      <section className="w-full max-w-[1200px] mx-auto px-4 md:px-10 pb-20">
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-background-light">
          <div
            className="absolute inset-0 grayscale opacity-70 dark:opacity-40"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD4vjZtfe1x1DtHl4Q3_64bPrQuz7qxRtIl40YGEuIxXt6KpvLAUfIYkTPqGFQ6E9pR-4CczH1rgp1hEF6UykoOiJDIDZsDA0WyBgq5J5Eumvf4tJCZOWIB3LWJikTzRaqcsJG3l3nNtqfqqZWMb2UEULWNQ730z2xVjvLdoMEtY9wxwLXIxY7Uj6EAmQI4XgCNIfbtcu8d-03L2ftCFjRncUQt9lOp8SRvuv2beKTHKGqPAQn_5xEshMWhbDVk0NNYxdmE6GSoQoVj")',
              backgroundSize: 'cover',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-2 border border-[#B08968]">
              <span className="material-icons-outlined text-primary text-4xl">
                location_on
              </span>
              <p className="font-bold text-primary">
                Ghé thăm trụ sở của chúng tôi
              </p>
              <a
                href="#"
                className="text-sm text-[#B08968] font-medium hover:underline"
              >
                Mở trên Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
