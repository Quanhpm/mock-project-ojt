import { Link } from 'react-router-dom';
import { useClientAuthStore } from '../../auth-client/stores/client-auth.store';

function HomePage() {
  const { isLoggedIn } = useClientAuthStore();

  return (
    <div className="bg-[var(--cf-bg)]">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=1920&h=1080&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <div className="inline-block px-4 py-2 mb-6 border border-orange-500 rounded-full">
            <span className="text-orange-500 font-semibold tracking-wider">☕ BOUTIQUE BREWS</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Start Your<br />Morning Right
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of coffee lovers and earn rewards with every sip. 
            Experience the finest beans sourced ethically from around the globe.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              to="/menu"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Khám phá Menu
            </Link>
            {!isLoggedIn && (
              <Link
                to="/client/register"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg border-2 border-white transition-all"
              >
                Đăng ký ngay
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--cf-primary)] mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm cà phê tuyệt vời nhất cho bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-[var(--cf-surface)] hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-[var(--cf-primary)] mb-3">
                100% Organic
              </h3>
              <p className="text-gray-600">
                Hạt cà phê organic được trồng và chăm sóc tự nhiên, 
                không sử dụng hóa chất độc hại
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-[var(--cf-surface)] hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-[var(--cf-primary)] mb-3">
                Giao hàng nhanh
              </h3>
              <p className="text-gray-600">
                Đặt hàng online và nhận trong vòng 30 phút. 
                Cam kết giữ nhiệt độ và chất lượng tốt nhất
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-[var(--cf-surface)] hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-[var(--cf-primary)] mb-3">
                Tích điểm đổi quà
              </h3>
              <p className="text-gray-600">
                Mỗi đơn hàng tích điểm, đổi quà hấp dẫn. 
                Ưu đãi đặc biệt cho thành viên thân thiết
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-20 bg-[var(--cf-bg)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--cf-primary)] mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những món được yêu thích nhất tại Boutique Brews
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Product Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-7xl">☕</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[var(--cf-primary)] mb-2">
                  Espresso
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Cà phê espresso đậm đà, tinh túy Ý
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-orange-500">45.000đ</span>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-7xl">🥤</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[var(--cf-primary)] mb-2">
                  Latte
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Sữa tươi hòa quyện cùng cà phê
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-orange-500">55.000đ</span>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-7xl">🧊</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[var(--cf-primary)] mb-2">
                  Cold Brew
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Cà phê ủ lạnh 24h, mát lạnh sảng khoái
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-orange-500">60.000đ</span>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 4 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-7xl">🍵</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[var(--cf-primary)] mb-2">
                  Matcha Latte
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Trà xanh Matcha Nhật Bản cao cấp
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-orange-500">65.000đ</span>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-block px-8 py-4 bg-[var(--cf-secondary)] hover:bg-[var(--cf-dark)] text-white font-bold rounded-lg shadow-lg transition-all"
            >
              Xem toàn bộ Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Bắt đầu hành trình cà phê của bạn
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay để nhận ưu đãi 20% cho đơn hàng đầu tiên
            </p>
            <Link
              to="/client/register"
              className="inline-block px-10 py-4 bg-white text-orange-500 font-bold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--cf-primary)] mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[var(--cf-surface)] p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <img 
                  src="https://i.pravatar.cc/150?img=1" 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-[var(--cf-primary)]">Nguyễn Văn An</h4>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Cà phê ở đây thật sự tuyệt vời! Hương vị đậm đà, 
                giá cả hợp lý. Tôi sẽ quay lại nhiều lần nữa."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[var(--cf-surface)] p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <img 
                  src="https://i.pravatar.cc/150?img=2" 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-[var(--cf-primary)]">Trần Thị Bình</h4>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Không gian đẹp, nhân viên thân thiện. 
                Cold brew ở đây là món yêu thích của tôi!"
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[var(--cf-surface)] p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <img 
                  src="https://i.pravatar.cc/150?img=3" 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-[var(--cf-primary)]">Lê Minh Châu</h4>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Giao hàng nhanh, đóng gói cẩn thận. 
                Chương trình tích điểm rất hấp dẫn!"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;