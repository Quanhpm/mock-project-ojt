import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/config";
import { HttpError, type ApiErrorResponse, API_ERROR_CODES } from "./http.types";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";

// ======================== Axios Instance ========================

export const axiosClient = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true, // Cookie tự động gửi mỗi request
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================== Refresh Token Queue ========================

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

/** Xử lý tất cả request đang chờ sau khi refresh xong */
const processQueue = (error: unknown = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  refreshQueue = [];
};

// ======================== Setup Interceptors ========================

export const setupApi = () => {
  responseInterceptor();
};

// ======================== Response Interceptor ========================

const responseInterceptor = () => {
  axiosClient.interceptors.response.use(
    // ✅ Thành công → trả response bình thường
    (response) => response,

    // ❌ Lỗi → xử lý 401/refresh hoặc throw HttpError
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // ──────── Validate originalRequest ────────
      if (!originalRequest) {
        console.error("[Interceptor] No request config found");
        throw new HttpError({
          status: 0,
          message: "Invalid request configuration",
          code: "INVALID_REQUEST",
        });
      }

      // ──────── Network error (no response) ────────
      if (!error.response) {
        throw new HttpError({
          status: 0,
          message: "Network error. Please check your connection.",
          code: "NETWORK_ERROR",
        });
      }

      const status = error.response?.status ?? 0;
      const data = error.response?.data;
      const errorCode = data?.code ?? data?.message ?? "";

      // ──────── Token hết hạn → Auto Refresh ────────
      // Only trigger refresh for ACCESS_TOKEN_EXPIRED (backend returns exact code)
      if (
        status === 401 &&
        errorCode === API_ERROR_CODES.ACCESS_TOKEN_EXPIRED &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh-token')
      ) {
        // Đánh dấu request này đã retry (tránh loop vô hạn)
        originalRequest._retry = true;

        // Race condition protection: Double-check isRefreshing
        if (isRefreshing) {
          console.log("[Interceptor] Already refreshing, adding to queue");
          return new Promise<void>((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then(() => {
            // ✅ Clear old Authorization header trước retry
            delete originalRequest.headers?.Authorization;
            return axiosClient(originalRequest);
          });
        }

        // Bắt đầu refresh - Set flag immediately
        console.log("[Interceptor] Starting token refresh...");
        isRefreshing = true;

        try {
          // Gọi API refresh (cookie refresh_token tự gửi) - GET method
          console.log("[Interceptor] Calling GET /auth/refresh-token...");
          await axios.get(`${ENV.API_URL}/auth/refresh-token`, {
            withCredentials: true,
          });

          console.log("[Interceptor] Token refresh SUCCESS");
          // Refresh thành công → retry tất cả request đang chờ
          processQueue();

          // ✅ Clear old Authorization header trước retry
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization;
          }
          return axiosClient(originalRequest);
        } catch (refreshError) {
          console.error("[Interceptor] Token refresh FAILED:", refreshError);
          
          // ❌ Refresh token fail → logout và redirect login
          processQueue(refreshError);
          
          const { logout } = useAdminAuthStore.getState();
          await logout();
          
          // Use replace to prevent back button issues
          window.location.replace('/admin/login');

          throw new HttpError({
            status: 401,
            message: "Session expired. Please login again.",
            code: "REFRESH_TOKEN_FAILED",
          });
        } finally {
          console.log("[Interceptor] Refresh process completed, resetting flag");
          isRefreshing = false;
          // Clear queue in case of any remaining items
          if (refreshQueue.length > 0) {
            console.warn("[Interceptor] Queue not empty after refresh, clearing...");
            refreshQueue = [];
          }
        }
      }

      // ──────── Các lỗi khác → throw HttpError ────────
      const message =
        data?.message ??
        data?.errors?.[0]?.message ??
        error.message ??
        "Request failed";

      throw new HttpError({
        status,
        message,
        code: data?.code ?? undefined,
        errors: data?.errors ?? undefined,
      });
    },
  );
};
