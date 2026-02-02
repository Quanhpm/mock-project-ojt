const ClientFooter = () => {
  return (
    <footer className="text-white py-8 mt-auto" style={{ backgroundColor: 'var(--cf-primary)' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Về Chúng Tôi</h3>
            <p className="text-sm" style={{ color: 'var(--cf-accent-light)' }}>
              Chúng tôi cung cấp sản phẩm chất lượng cao với dịch vụ khách hàng tốt nhất.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2">
              <li>
                <a href="/shop" className="text-sm transition-colors" style={{ color: 'var(--cf-accent-light)' }}>
                  Cửa Hàng
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm transition-colors" style={{ color: 'var(--cf-accent-light)' }}>
                  Giới Thiệu
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm transition-colors" style={{ color: 'var(--cf-accent-light)' }}>
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên Hệ</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--cf-accent-light)' }}>
              <li>Email: support@example.com</li>
              <li>Điện thoại: (84) 123-456-789</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 text-center" style={{ borderColor: 'var(--cf-dark)' }}>
          <p className="text-sm" style={{ color: 'var(--cf-accent-light)' }}>
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;