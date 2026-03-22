// Auth API endpoints
import { httpClient } from "@/apis/httpClient";
import { HttpError } from "@/apis/http.types";

// ======================== Types ========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SwitchContextRequest {
  franchise_id: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface ResendTokenRequest {
  email: string;
}

export interface UserInfo {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatar_url: string;
}

export interface UserRoleItem {
  role: string;
  scope: "GLOBAL" | "FRANCHISE";
  franchise_id: string | null;
  franchise_name: string | null;
}

export interface ActiveContext {
  role: string;
  scope: string;
  franchise_id: string | null;
}

export interface ProfileResponse {
  user: UserInfo;
  roles: UserRoleItem[];
  active_context: ActiveContext | null;
}

// ======================== API Functions ========================

/** POST /api/auth - Đăng nhập (backend set HttpOnly Cookie) */
export const login = (data: LoginRequest): Promise<null> => {
  return httpClient.post<null, LoginRequest>({
    url: "/auth",
    data,
  });
};

/** GET /api/auth - Lấy thông tin user hiện tại */
export const getProfile = (): Promise<ProfileResponse> => {
  return httpClient.get<ProfileResponse>({
    url: "/auth",
  }).then((profile) => {
    if (!profile) {
      throw new HttpError({
        status: 401,
        message: "Not authenticated",
        code: "NOT_AUTHENTICATED",
      });
    }
    return profile;
  });
};

/** POST /api/auth/logout - Đăng xuất (server xóa cookie) */
export const logout = (): Promise<null> => {
  return httpClient.post<null>({
    url: "/auth/logout",
  });
};

/** POST /api/auth/switch-context - Chọn franchise context (null = GLOBAL) */
export const switchContext = (franchise_id: string | null): Promise<ProfileResponse | null> => {
  return httpClient.post<ProfileResponse, SwitchContextRequest>({
    url: "/auth/switch-context",
    data: { franchise_id },
  });
};

/** GET /api/auth/refresh-token - Refresh access token */
export const refreshToken = (): Promise<ProfileResponse | null> => {
  return httpClient.get<ProfileResponse>({
    url: "/auth/refresh-token",
  });
};

/** PUT /api/auth/forgot-password - Gửi email quên mật khẩu */
export const forgotPassword = (
  data: ForgotPasswordRequest,
): Promise<null> => {
  return httpClient.put<null, ForgotPasswordRequest>({
    url: "/auth/forgot-password",
    data,
  });
};

/** PUT /api/auth/change-password - Đổi mật khẩu */
export const changePassword = (
  data: ChangePasswordRequest,
): Promise<null> => {
  return httpClient.put<null, ChangePasswordRequest>({
    url: "/auth/change-password",
    data,
  });
};

/** POST /api/auth/verify-token - Xác thực email người dùng mới */
export const verifyEmail = (token: string): Promise<null> => {
  return httpClient.post<null, VerifyTokenRequest>({
    url: "/auth/verify-token",
    data: { token },
  });
};

/** Alias giữ tên đúng với backend action */
export const verifyToken = (data: VerifyTokenRequest): Promise<null> => {
  return httpClient.post<null, VerifyTokenRequest>({
    url: "/auth/verify-token",
    data,
  });
};

/** POST /api/auth/resend-token - Gửi lại token xác thực */
export const resendToken = (data: ResendTokenRequest): Promise<null> => {
  return httpClient.post<null, ResendTokenRequest>({
    url: "/auth/resend-token",
    data,
  });
};
