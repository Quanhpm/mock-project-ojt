import { axiosClient } from "../axios.config";
import type { AxiosResponse } from "axios";

// ======================== Types ========================

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  address: string;
  is_active: boolean;
  is_deleted: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerRegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface CustomerChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface CustomerForgotPasswordRequest {
  email: string;
}

export interface CustomerVerifyEmailRequest {
  token: string;
}

export interface CustomerLoginResponse {
  success: boolean;
  data: CustomerUser;
}

export interface CustomerRegisterResponse {
  success: boolean;
  data: CustomerUser;
}

export interface CustomerProfileResponse {
  success: boolean;
  data: CustomerUser;
}

export interface CustomerLogoutResponse {
  success: boolean;
  message?: string;
}

export interface CustomerForgotPasswordResponse {
  success: boolean;
  message?: string;
}

export interface CustomerChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface CustomerVerifyEmailResponse {
  success: boolean;
  data: CustomerUser;
}

// ======================== API Functions ========================

// LOGIN
export const loginCustomer = (
  data: CustomerLoginRequest
): Promise<AxiosResponse<CustomerLoginResponse>> => {
  return axiosClient.post<CustomerLoginResponse>("/customer-auth", data);
};

// REGISTER
export const registerCustomer = (
  data: CustomerRegisterRequest
): Promise<AxiosResponse<CustomerRegisterResponse>> => {
  return axiosClient.post<CustomerRegisterResponse>("/customers/register", data);
};

// GET PROFILE
export const getCustomerProfile = (): Promise<
  AxiosResponse<CustomerProfileResponse>
> => {
  return axiosClient.get<CustomerProfileResponse>("/customer-auth", {
    params: { _t: Date.now() },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
};

// UPDATE PROFILE
export const updateCustomerProfile = (
  data: Partial<CustomerUser>
): Promise<AxiosResponse<CustomerProfileResponse>> => {
  return axiosClient.put<CustomerProfileResponse>(`/customers/${data.id}`, data);
};

// LOGOUT
export const logoutCustomer = (): Promise<AxiosResponse<CustomerLogoutResponse>> => {
  return axiosClient.post<CustomerLogoutResponse>("/customer-auth/logout");
};

// FORGOT PASSWORD
export const forgotPassword = (
  email: string
): Promise<AxiosResponse<CustomerForgotPasswordResponse>> => {
  return axiosClient.put<CustomerForgotPasswordResponse>(
    "/customer-auth/forgot-password",
    { email }
  );
};

// CHANGE PASSWORD
export const changePassword = (
  data: CustomerChangePasswordRequest
): Promise<AxiosResponse<CustomerChangePasswordResponse>> => {
  return axiosClient.put<CustomerChangePasswordResponse>(
    "/customer-auth/change-password",
    data
  );
};

// VERIFY EMAIL
export const verifyEmail = (
  token: string
): Promise<AxiosResponse<CustomerVerifyEmailResponse>> => {
  return axiosClient.post<CustomerVerifyEmailResponse>(
    "/customer-auth/verify-token",
    { token }
  );
};