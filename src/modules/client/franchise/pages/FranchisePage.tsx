import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { franchiseSchema, type FranchiseFormValues } from '../schemas/franchise.schema';
import { useToast } from '@/hooks/use-toast.hook';
import { VIETNAM_PROVINCES } from '../constants/provinces.constant';

function FranchisePage() {
  const { success, error: showError } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FranchiseFormValues>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      location: 'TP. Hồ Chí Minh',
      budget: '3 - 4 tỷ VNĐ',
      experience: '',
      agreedToTerms: false,
    },
  });

  const onSubmit = async (data: FranchiseFormValues) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log('Franchise inquiry submitted:', data);
      
      // TODO: Implement actual API call to submit franchise inquiry
      // await franchiseApi.submitInquiry(data);
      
      success('Đăng ký thành công!', 'Cảm ơn bạn đã quan tâm! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
      reset();
    } catch (error) {
      showError('Đăng ký thất bại', 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error('Error submitting franchise inquiry:', error);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-[var(--cf-bg)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[var(--cf-accent-light)]/60 text-[var(--cf-primary)] rounded-full">
              Cơ hội nhượng quyền
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-[var(--cf-primary)]">
              Trở thành Đối tác <br />
              <span className="text-[var(--cf-secondary)]">Nhượng quyền</span>
            </h1>
            <p className="text-lg text-[var(--cf-dark)] mb-10 max-w-xl leading-relaxed">
              Tham gia vào cộng đồng tận tâm với nghệ thuật cà phê cao cấp và phát triển bền vững.
              Chúng tôi cung cấp nền tảng cho sự thành công trong khởi nghiệp của bạn.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#register"
                className="bg-[var(--cf-primary)] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[var(--cf-dark)] shadow-xl shadow-[var(--cf-primary)]/20 transition-all transform hover:-translate-y-1"
              >
                Đăng ký ngay
              </a>
              <a
                href="#"
                className="border-2 border-[var(--cf-primary)]/20 text-[var(--cf-primary)] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[var(--cf-surface)] transition-all"
              >
                Xem tài liệu
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-[var(--cf-accent-light)]/30 rounded-xl transform rotate-3"></div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                alt="Modern coffee shop interior"
                className="w-full aspect-square object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBriBZ_pwIVdpqjYbdu5SipnqrtzR3yDP4jj_O6R7f3qM2s3oYOhvd0kHUlGGluBeI0pRunsbYp6vzpoBRTFc5pFkwv_vD63qKxg2NsAUQ65c56_iTxcCRw1zuokn0-zsjbmEFfMVqizoE2okiPDQP6AoN6P6WkIj1H9r9J2A8btH2k70fbH3FYkRiR7V_4FJTk1_gsvThas5wrhIIvIHf7dltIAtsvP20N_cBD9icWlJitnT43kekbgwTyCbvCZTfBs6C_9xrLb1Q"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl border border-[var(--cf-accent-light)]/40 max-w-xs">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-icons-outlined text-[var(--cf-secondary)]">
                  verified
                </span>
                <span className="font-bold text-sm text-[var(--cf-primary)]">
                  Chất lượng được chứng nhận
                </span>
              </div>
              <p className="text-xs text-[var(--cf-primary)]/60 italic">
                "Mạng lưới nhượng quyền hỗ trợ tốt nhất mà tôi từng tham gia." - Sarah J., Đối tác từ 2021
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[var(--cf-surface)]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[var(--cf-primary)]">
              Tại sao chọn Boutique Brews?
            </h2>
            <div className="w-20 h-1.5 bg-[var(--cf-secondary)] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group border border-[var(--cf-accent-light)]/20">
              <div className="w-14 h-14 bg-[var(--cf-surface)] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--cf-primary)] transition-colors">
                <span className="material-icons-outlined text-[var(--cf-primary)] group-hover:text-white">
                  public
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--cf-primary)]">
                Thương hiệu toàn cầu
              </h3>
              <p className="text-sm text-[var(--cf-primary)]/70 leading-relaxed">
                Tận dụng uy tín thương hiệu cà phê đặc sản với lượng khách hàng trung thành quốc tế.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group border border-[var(--cf-accent-light)]/20">
              <div className="w-14 h-14 bg-[var(--cf-surface)] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--cf-primary)] transition-colors">
                <span className="material-icons-outlined text-[var(--cf-primary)] group-hover:text-white">
                  inventory_2
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--cf-primary)]">
                Chuỗi cung ứng xuất sắc
              </h3>
              <p className="text-sm text-[var(--cf-primary)]/70 leading-relaxed">
                Tiếp cận trực tiếp nguồn cà phê có đạo đức và đối tác rang xay độc quyền.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group border border-[var(--cf-accent-light)]/20">
              <div className="w-14 h-14 bg-[var(--cf-surface)] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--cf-primary)] transition-colors">
                <span className="material-icons-outlined text-[var(--cf-primary)] group-hover:text-white">
                  school
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--cf-primary)]">
                Đào tạo toàn diện
              </h3>
              <p className="text-sm text-[var(--cf-primary)]/70 leading-relaxed">
                Chương trình đào tạo barista và quản lý đầy đủ để đảm bảo thành thạo vận hành.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group border border-[var(--cf-accent-light)]/20">
              <div className="w-14 h-14 bg-[var(--cf-surface)] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--cf-primary)] transition-colors">
                <span className="material-icons-outlined text-[var(--cf-primary)] group-hover:text-white">
                  architecture
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--cf-primary)]">
                Thiết kế cửa hàng sáng tạo
              </h3>
              <p className="text-sm text-[var(--cf-primary)]/70 leading-relaxed">
                Concept nội thất đoạt giải thưởng tối ưu hóa lưu lượng và sự thoải mái của khách.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Overview */}
      <section className="py-24 bg-[var(--cf-bg)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-[var(--cf-primary)]">
                Tổng quan đầu tư
              </h2>
              <p className="text-[var(--cf-secondary)] mb-8 leading-relaxed">
                Chúng tôi duy trì tính minh bạch trong mô hình tài chính. Mục tiêu là đảm bảo 
                dự án bền vững và sinh lời cho mỗi đối tác.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-[var(--cf-primary)]">
                    check_circle
                  </span>
                  <span className="text-sm font-medium text-[var(--cf-primary)]">
                    Không có phí marketing ẩn
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-[var(--cf-primary)]">
                    check_circle
                  </span>
                  <span className="text-sm font-medium text-[var(--cf-primary)]">
                    Ưu đãi mặt bằng bất động sản
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="bg-[var(--cf-accent-light)] p-10 rounded-xl border border-[var(--cf-primary)]/10">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--cf-primary)]/60 mb-2">
                  Vốn đầu tư ban đầu
                </p>
                <p className="text-4xl font-bold text-[var(--cf-primary)]">3 - 6 tỷ VNĐ</p>
              </div>
              <div className="bg-[var(--cf-surface)] p-10 rounded-xl border border-[var(--cf-primary)]/10">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--cf-primary)]/60 mb-2">
                  Phí nhượng quyền
                </p>
                <p className="text-4xl font-bold text-[var(--cf-primary)]">850 triệu VNĐ</p>
              </div>
              <div className="bg-[var(--cf-surface)] p-10 rounded-xl border border-[var(--cf-primary)]/10">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--cf-primary)]/60 mb-2">
                  Diện tích cửa hàng
                </p>
                <p className="text-4xl font-bold text-[var(--cf-primary)]">
                  80 - 150 <span className="text-xl">m²</span>
                </p>
              </div>
              <div className="bg-[var(--cf-accent-light)] p-10 rounded-xl border border-[var(--cf-primary)]/10">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--cf-primary)]/60 mb-2">
                  Thời gian hoàn vốn
                </p>
                <p className="text-4xl font-bold text-[var(--cf-primary)]">
                  18 - 24 <span className="text-xl">tháng</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section
        className="py-24 bg-[var(--cf-surface)]/30"
        id="register"
      >
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-[var(--cf-accent-light)]/30">
            <div className="bg-[var(--cf-primary)] px-8 py-10 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Đăng ký quan tâm nhượng quyền
              </h2>
              <p className="text-[var(--cf-accent-light)] text-sm">
                Chia sẻ thông tin về bạn và tầm nhìn của bạn với Boutique Brews.
              </p>
            </div>
            <div className="p-8 lg:p-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--cf-primary)]">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      className="w-full bg-[var(--cf-bg)] border border-[var(--cf-accent-light)]/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--cf-primary)] focus:border-[var(--cf-primary)] outline-none transition-all text-[var(--cf-primary)]"
                      placeholder="Nguyễn Văn A"
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600 mt-1 ml-1">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--cf-primary)]">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full bg-[var(--cf-bg)] border border-[var(--cf-accent-light)]/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--cf-primary)] focus:border-[var(--cf-primary)] outline-none transition-all text-[var(--cf-primary)]"
                      placeholder="email@example.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1 ml-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--cf-primary)]">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full bg-[var(--cf-bg)] border border-[var(--cf-accent-light)]/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--cf-primary)] focus:border-[var(--cf-primary)] outline-none transition-all text-[var(--cf-primary)]"
                      placeholder="0912345678"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1 ml-1">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--cf-primary)]">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      {...register('location')}
                      className="w-full bg-[var(--cf-bg)] border border-[var(--cf-accent-light)]/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--cf-primary)] focus:border-[var(--cf-primary)] outline-none transition-all text-[var(--cf-primary)] appearance-none"
                      disabled={isSubmitting}
                    >
                      {VIETNAM_PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {errors.location && (
                      <p className="text-xs text-red-600 mt-1 ml-1">{errors.location.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--cf-primary)]">
                    Ngân sách đầu tư
                  </label>
                  <select
                    {...register('budget')}
                    className="w-full bg-[var(--cf-bg)] border border-[var(--cf-accent-light)]/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--cf-primary)] focus:border-[var(--cf-primary)] outline-none transition-all text-[var(--cf-primary)] appearance-none"
                    disabled={isSubmitting}
                  >
                    <option>3 - 4 tỷ VNĐ</option>
                    <option>4 - 5 tỷ VNĐ</option>
                    <option>5 - 6 tỷ VNĐ</option>
                    <option>Trên 6 tỷ VNĐ</option>
                  </select>
                  {errors.budget && (
                    <p className="text-xs text-red-600 mt-1 ml-1">{errors.budget.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--cf-primary)]">
                    Kinh nghiệm kinh doanh
                  </label>
                  <textarea
                    {...register('experience')}
                    className="w-full bg-[var(--cf-bg)] border border-[var(--cf-accent-light)]/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--cf-primary)] focus:border-[var(--cf-primary)] outline-none transition-all text-[var(--cf-primary)] resize-none"
                    placeholder="Mô tả ngắn gọn về kinh nghiệm chuyên môn của bạn..."
                    rows={4}
                    disabled={isSubmitting}
                  />
                  {errors.experience && (
                    <p className="text-xs text-red-600 mt-1 ml-1">{errors.experience.message}</p>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    {...register('agreedToTerms')}
                    className="mt-1 rounded text-[var(--cf-primary)] focus:ring-[var(--cf-primary)] border-[var(--cf-accent-light)]/50"
                    disabled={isSubmitting}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--cf-primary)]/60 leading-relaxed">
                      Tôi đồng ý với điều khoản dịch vụ và cho phép được liên hệ bởi đội ngũ 
                      mở rộng Boutique Brews về cơ hội đối tác.
                    </p>
                    {errors.agreedToTerms && (
                      <p className="text-xs text-red-600 mt-1">{errors.agreedToTerms.message}</p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--cf-primary)] text-white py-4 rounded-lg font-bold text-lg hover:bg-[var(--cf-dark)] transition-colors shadow-lg shadow-[var(--cf-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu đối tác'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[var(--cf-primary)] py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Bắt đầu kinh doanh cà phê của bạn ngay hôm nay
          </h2>
          <p className="text-[var(--cf-accent-light)] mb-10 text-lg">
            Tham gia cùng hơn 45 đối tác thành công trên toàn thế giới trong việc mang đến ly cà phê hoàn hảo.
          </p>
          <a
            href="#register"
            className="inline-block border-2 border-white text-white px-10 py-4 rounded-lg font-bold hover:bg-white hover:text-[var(--cf-primary)] transition-all"
          >
            Tham gia mạng lưới
          </a>
        </div>
      </section>
    </>
  );
}

export default FranchisePage;
