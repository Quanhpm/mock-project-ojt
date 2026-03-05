import { httpClient } from "../httpClient";

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

// ======================== API Functions ========================

// LOGIN
export const loginCustomer = (
  data: CustomerLoginRequest,
): Promise<null> => {
  return httpClient.post<null, CustomerLoginRequest>({
    url: '/customer-auth',
    data,
  });
};

// REGISTER
export const registerCustomer = (
  data: CustomerRegisterRequest,
): Promise<CustomerUser | null> => {
  return httpClient.post<CustomerUser, CustomerRegisterRequest>({
    url: '/customers/register',
    data,
  });
};

// GET PROFILE
export const getCustomerProfile = (): Promise<CustomerUser | null> => {
  return httpClient.get<CustomerUser>({
    url: '/customer-auth',
  });
};

// UPDATE PROFILE
export const updateCustomerProfile = (
  data: Partial<CustomerUser>,
): Promise<CustomerUser | null> => {
  return httpClient.put<CustomerUser, Partial<CustomerUser>>({
    url: `/customers/${data.id}`,
    data,
  });
};

// LOGOUT
export const logoutCustomer = (): Promise<null> => {
  return httpClient.post<null, never>({
    url: '/customer-auth/logout',
  });
};

// FORGOT PASSWORD
export const forgotPassword = (
  email: string,
): Promise<null> => {
  return httpClient.put<null, { email: string }>({
    url: '/customer-auth/forgot-password',
    data: { email },
  });
};

// CHANGE PASSWORD
export const changePassword = (
  data: CustomerChangePasswordRequest,
): Promise<null> => {
  return httpClient.put<null, CustomerChangePasswordRequest>({
    url: '/customer-auth/change-password',
    data,
  });
};

// VERIFY EMAIL
export const verifyEmail = (
  token: string,
): Promise<CustomerUser | null> => {
  return httpClient.post<CustomerUser, { token: string }>({
    url: '/customer-auth/verify-token',
    data: { token },
  });
};
