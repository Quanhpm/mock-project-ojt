import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/config";
import { HttpError, type ApiErrorResponse } from "./http.types";
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
      if (
        status === 401 &&
        errorCode === "ACCESS_TOKEN_EXPIRED" &&
        !originalRequest._retry
      ) {
        // Đánh dấu request này đã retry (tránh loop vô hạn)
        originalRequest._retry = true;

        // Nếu đang refresh → xếp hàng chờ
        if (isRefreshing) {
          return new Promise<void>((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then(() => axiosClient(originalRequest));
        }

        // Bắt đầu refresh
        isRefreshing = true;

        try {
          // Gọi API refresh (cookie refresh_token tự gửi)
          await axios.post(`${ENV.API_URL}/auth/refresh-token`, null, {
            withCredentials: true,
          });

          // Refresh thành công → retry tất cả request đang chờ
          processQueue();

          return axiosClient(originalRequest);
        } catch (refreshError) {
          // ❌ Refresh token bị 401 → logout
          if (originalRequest.url?.includes('/auth/refresh-token')) {
            const { logout } = useAdminAuthStore.getState();
            await logout();
            window.location.href = '/admin/login';

            throw new HttpError({
              status: 401,
              message: "Session expired. Please login again.",
              code: "REFRESH_TOKEN_FAILED",
            });
          }

          // Refresh thất bại → reject tất cả queue
          processQueue(refreshError);

          // Người làm auth sẽ listen lỗi này để xử lý logout/redirect
          throw new HttpError({
            status: 401,
            message: "Session expired. Please login again.",
            code: "REFRESH_TOKEN_FAILED",
          });
        } finally {
          isRefreshing = false;
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
