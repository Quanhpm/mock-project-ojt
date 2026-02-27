import axiosClient from "./axiosClient"; // Sẽ setup file này ở bước sau nếu bạn chưa có
import type {
  ApiResponse,
  Customer,
  CustomerSearchPayload,
  CustomerSearchResponse,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerStatusPayload,
  ForgotPasswordPayload,
  ChangePasswordPayload,
} from "./customer.types";

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
    const response = await axiosClient.post<CustomerSearchResponse>(
      "/api/customers/search",
      payload,
    );
    return response.data; // Trả về thẳng data vì Axios bọc response trong object data của nó
  },

  /**
   * CUSTOMER-04: Lấy thông tin chi tiết 1 khách hàng (Dùng để fill vào form Edit)
   */
  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    const response = await axiosClient.get<ApiResponse<Customer>>(
      `/api/customers/${id}`,
    );
    return response.data;
  },

  /**
   * CUSTOMER-02: Tạo mới khách hàng
   */
  createCustomer: async (
    payload: CustomerCreatePayload,
  ): Promise<ApiResponse<Customer>> => {
    const response = await axiosClient.post<ApiResponse<Customer>>(
      "/api/customers",
      payload,
    );
    return response.data;
  },

  /**
   * CUSTOMER-05: Cập nhật thông tin khách hàng
   */
  updateCustomer: async (
    id: string,
    payload: CustomerUpdatePayload,
  ): Promise<ApiResponse<Customer>> => {
    const response = await axiosClient.put<ApiResponse<Customer>>(
      `/api/customers/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * CUSTOMER-06: Xóa khách hàng (Xóa mềm)
   */
  deleteCustomer: async (id: string): Promise<ApiResponse<any>> => {
    const response = await axiosClient.delete<ApiResponse<any>>(
      `/api/customers/${id}`,
    );
    return response.data;
  },

  /**
   * CUSTOMER-08: Thay đổi trạng thái Active/Inactive
   */
  toggleCustomerStatus: async (
    id: string,
    payload: CustomerStatusPayload,
  ): Promise<ApiResponse<Customer>> => {
    const response = await axiosClient.put<ApiResponse<Customer>>(
      `/api/customers/${id}/status`,
      payload,
    );
    return response.data;
  },

  // ============================================================================
  // AUTHENTICATION APIS (Dành cho chức năng Forgot/Change Password của Admin)
  // Nếu làm cho end-user, bạn đổi '/api/auth' thành '/api/customer-auth'
  // ============================================================================

  /**
   * AUTH-05: Quên mật khẩu (Gửi mật khẩu mới về email)
   */
  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<ApiResponse<any>> => {
    const response = await axiosClient.put<ApiResponse<any>>(
      "/api/auth/forgot-password",
      payload,
    );
    return response.data;
  },

  /**
   * AUTH-06: Đổi mật khẩu (Sau khi nhận được mật khẩu tự sinh từ email)
   */
  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<ApiResponse<any>> => {
    const response = await axiosClient.put<ApiResponse<any>>(
      "/api/auth/change-password",
      payload,
    );
    return response.data;
  },
};
