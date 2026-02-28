import { axiosClient } from "../axios.config";
import type { AxiosResponse } from "axios";

// ======================== Types ========================

export interface CustomerUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  is_deleted: boolean;
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
  message: string;
  data: {
    user: CustomerUser;
  };
}

export interface CustomerRegisterResponse {
  message: string;
  data: {
    user: CustomerUser;
  };
}

export interface CustomerProfileResponse {
  message: string;
  data: {
    user: CustomerUser;
  };
}

export interface CustomerLogoutResponse {
  message: string;
}

export interface CustomerForgotPasswordResponse {
  message: string;
}

export interface CustomerChangePasswordResponse {
  message: string;
}

export interface CustomerVerifyEmailResponse {
  message: string;
  data: {
    user: CustomerUser;
  };
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

// PROFILE
export const getCustomerProfile = (): Promise<
  AxiosResponse<CustomerProfileResponse>
> => {
  return axiosClient.get<CustomerProfileResponse>("/customer-auth");
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