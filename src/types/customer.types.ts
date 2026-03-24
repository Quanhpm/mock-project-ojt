// ============================================================================
// BASE INTERFACES (Cấu trúc dữ liệu cốt lõi)
// ============================================================================

// Dựa theo chính xác cục JSON bạn đã test thành công trên Postman
export interface Customer {
  id: string;
  email: string;
  phone: string;
  name: string;
  address: string;
  avatar_url: string;
  is_active: boolean;
  is_deleted: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Interface chung cho Response từ Backend trả về
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

// ============================================================================
// SEARCH & PAGINATION (Dành cho API CUSTOMER-03)
// ============================================================================

export interface CustomerSearchCondition {
  keyword: string;
  is_active?: boolean | null; // Có thể null nếu muốn lấy tất cả
  is_deleted?: boolean;
}

export interface PageInfoRequest {
  pageNum: number;
  pageSize: number;
}

export interface CustomerSearchPayload {
  searchCondition: CustomerSearchCondition;
  pageInfo: PageInfoRequest;
}

export interface PageInfoResponse {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Response trả về khi gọi Search
export interface CustomerSearchResponse {
  success: boolean;
  data: Customer[];
  pageInfo: PageInfoResponse;
}

// ============================================================================
// CREATE & UPDATE PAYLOADS (Dành cho Form Submit)
// ============================================================================

// Payload gửi lên khi tạo mới (CUSTOMER-02) - Bắt buộc có password
export interface CustomerCreatePayload {
  email: string;
  password?: string; // Dùng optional vì khi validate có thể bỏ trống lúc type, nhưng Yup sẽ bắt lỗi
  phone: string;
  name?: string;
  address?: string;
  avatar_url?: string;
}

// Payload gửi lên khi cập nhật (CUSTOMER-05) - TUYỆT ĐỐI KHÔNG CÓ password
export interface CustomerUpdatePayload {
  email: string;
  phone: string;
  name?: string;
  address?: string;
  avatar_url?: string | null;
}

// Payload thay đổi trạng thái (CUSTOMER-08)
export interface CustomerStatusPayload {
  is_active: boolean;
}

// ============================================================================
// AUTHENTICATION (Dành cho tính năng Forgot Password)
// ============================================================================

export interface ForgotPasswordPayload {
  email: string;
}

export interface ChangePasswordPayload {
  old_password: string; // Mật khẩu hệ thống tự sinh gửi qua email
  new_password: string; // Mật khẩu người dùng tự đặt lại
}
