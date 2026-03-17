import { httpClient } from "@/apis";
import { axiosClient } from "@/apis/axios.config";
import type {
  Customer,
  CustomerSearchPayload,
  CustomerSearchResponse,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerStatusPayload,
  ForgotPasswordPayload,
  ChangePasswordPayload,
} from "./../../types/customer.types";

// ============================================================================
// CUSTOMER MANAGEMENT APIS (Dành cho Admin/Staff)
// ============================================================================

export const customerApi = {
  /**
   * CUSTOMER-03: Lấy danh sách khách hàng (Có tìm kiếm và phân trang)
   */
  searchCustomers: async (
    payload: CustomerSearchPayload,
  ): Promise<CustomerSearchResponse> => {
    // Sử dụng axiosClient trực tiếp vì response có cấu trúc đặc biệt với pageInfo
    const response = await axiosClient.post<CustomerSearchResponse>(
      "/customers/search",
      payload,
    );
    return response.data;
  },

  /**
   * CUSTOMER-04: Lấy thông tin chi tiết 1 khách hàng (Dùng để fill vào form Edit)
   */
  getCustomerById: async (id: string): Promise<Customer> => {
    const data = await httpClient.get<Customer>({
      url: `/customers/${id}`,
    });
    return data!; // Non-null assertion vì API này luôn trả về data
  },

  /**
   * CUSTOMER-02: Tạo mới khách hàng
   */
  createCustomer: async (payload: CustomerCreatePayload): Promise<Customer> => {
    const data = await httpClient.post<Customer>({
      url: "/customers",
      data: payload,
    });
    return data!; // Non-null assertion vì API này luôn trả về data
  },

  /**
   * CUSTOMER-05: Cập nhật thông tin khách hàng
   */
  updateCustomer: async (
    id: string,
    payload: CustomerUpdatePayload,
  ): Promise<Customer> => {
    const data = await httpClient.put<Customer>({
      url: `/customers/${id}`,
      data: payload,
    });
    return data!; // Non-null assertion vì API này luôn trả về data
  },

  /**
   * CUSTOMER-06: Xóa khách hàng (Xóa mềm)
   */
  deleteCustomer: async (id: string): Promise<void> => {
    await httpClient.delete({
      url: `/customers/${id}`,
    });
    // Delete API thường không trả data, chỉ cần thành công
  },

  /**
   * CUSTOMER-07: Khôi phục khách hàng đã bị xóa mềm
   */
  restoreCustomer: async (id: string): Promise<Customer> => {
    const data = await httpClient.patch<Customer>({
      url: `/customers/${id}/restore`,
    });
    return data!;
  },

  /**
   * CUSTOMER-08: Thay đổi trạng thái Active/Inactive
   * Sử dụng PATCH để partial update (chỉ cập nhật is_active, không cần các field khác)
   */
  toggleCustomerStatus: async (
    id: string,
    payload: CustomerStatusPayload,
  ): Promise<Customer> => {
    const data = await httpClient.patch<Customer>({
      url: `/customers/${id}/status`,
      data: payload,
    });
    return data!; // Non-null assertion vì API này luôn trả về data
  },

  // ============================================================================
  // AUTHENTICATION APIS (Dành cho chức năng Forgot/Change Password của Admin)
  // Nếu làm cho end-user, bạn đổi '/api/auth' thành '/api/customer-auth'
  // ============================================================================

  /**
   * AUTH-05: Quên mật khẩu (Gửi mật khẩu mới về email)
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await httpClient.put({
      url: "/auth/forgot-password",
      data: payload,
    });
    // Forgot password thường chỉ cần thành công, không cần data response
  },

  /**
   * AUTH-06: Đổi mật khẩu (Sau khi nhận được mật khẩu tự sinh từ email)
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await httpClient.put({
      url: "/auth/change-password",
      data: payload,
    });
    // Change password thường chỉ cần thành công, không cần data response
  },
};
