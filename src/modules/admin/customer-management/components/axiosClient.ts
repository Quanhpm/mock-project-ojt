import axios from "axios";

// ============================================================================
// KHỞI TẠO AXIOS INSTANCE
// ============================================================================
const axiosClient = axios.create({
  // Sử dụng biến môi trường của Vite, hoặc fallback về localhost nếu chưa cấu hình
  baseURL: "https://ecommerce-franchise-training-nodejs.vercel.app",

  headers: {
    "Content-Type": "application/json",
  },

  // DÒNG CỰC KỲ QUAN TRỌNG:
  // Cho phép trình duyệt tự động đính kèm HttpOnly Cookie (chứa Token) lên Server
  withCredentials: true,
});

// ============================================================================
// REQUEST INTERCEPTOR (Bảo vệ chiều ĐI)
// ============================================================================
axiosClient.interceptors.request.use(
  (config) => {
    // Nếu dự án của bạn lưu token vào LocalStorage (thay vì Cookie),
    // đoạn code này sẽ tự động lấy Token ra và gắn vào Header "Bearer" giống hệt Postman.
    const accessToken = localStorage.getItem("access_token");

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    // Xử lý lỗi trước khi request được gửi đi (rất hiếm khi xảy ra)
    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR (Bảo vệ chiều VỀ)
// ============================================================================
axiosClient.interceptors.response.use(
  (response) => {
    // Bất kỳ mã HTTP Status nào nằm trong khoảng 2xx sẽ chạy vào đây.
    // Trả response đi tiếp đến file customer.api.ts
    return response;
  },
  (error) => {
    // Bất kỳ mã HTTP Status nào lọt ra ngoài khoảng 2xx (400, 401, 403, 500...) sẽ chạy vào đây.
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401: // UNAUTHORIZED: Token hết hạn hoặc chưa đăng nhập
          console.error(
            "Lỗi 401: Token đã hết hạn! Đang chuyển hướng về trang Login...",
          );

          // 1. Xóa token cũ rác đi
          localStorage.removeItem("access_token");

          // 2. Đá người dùng văng ra trang đăng nhập
          // Dùng window.location.href để ép trình duyệt load lại cây DOM, xóa sạch state cũ
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;

        case 403: // FORBIDDEN: Không có quyền (Ví dụ: Franchise Staff bấm xóa khách hàng)
          console.error("Lỗi 403: Bạn không có quyền thực hiện chức năng này!");
          // Thường thì ở đây người ta sẽ gọi thư viện Toast để báo lỗi màu đỏ lên góc màn hình
          break;

        case 500: // INTERNAL SERVER ERROR: Lỗi code backend (giống vụ secretKey ban nãy)
          console.error("Lỗi 500: Server Backend đang gặp sự cố!");
          break;

        default:
          break;
      }
    }

    // Ném lỗi đi tiếp để các Component React bên ngoài (CustomerTable) tự bắt bằng try/catch
    return Promise.reject(error);
  },
);

export default axiosClient;
