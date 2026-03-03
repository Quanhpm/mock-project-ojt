import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/config";
import { HttpError, type ApiErrorResponse, API_ERROR_CODES } from "./http.types";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useClientAuthStore } from "@/modules/client/auth-client/stores/client-auth.store";
import { useLoadingStore } from "@/stores/loading.store";

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
  requestInterceptor();
  responseInterceptor();
};

// ======================== Request Interceptor ========================

/**
 * Mỗi khi có request bắt đầu → tăng counter → hiển thị loading overlay.
 * Các URL ngoại lệ (auth/refresh-token, auth/logout) được bỏ qua
 * để tránh flash loading không cần thiết trong background.
 */
const SKIP_LOADING_URLS = ['/auth/refresh-token', '/auth/logout'];

const requestInterceptor = () => {
  axiosClient.interceptors.request.use(
    (config) => {
      const shouldSkip = SKIP_LOADING_URLS.some((url) =>
        config.url?.includes(url),
      );
      if (!shouldSkip) {
        useLoadingStore.getState().increment();
      }
      return config;
    },
    (error) => {
      useLoadingStore.getState().decrement();
      return Promise.reject(error);
    },
  );
};

// ======================== Response Interceptor ========================

/**
 * Tạo clean config mới từ originalRequest để retry.
 * QUAN TRỌNG: KHÔNG reuse originalRequest trực tiếp vì Axios đã serialize
 * headers cũ (bao gồm stale cookies) vào object đó. Khi tạo config mới,
 * Axios sẽ build lại headers từ đầu và browser sẽ attach cookie mới
 * (access_token vừa được refresh) vào retry request.
 */
const buildRetryConfig = (
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
) => {
  return {
    method: originalRequest.method,
    url: originalRequest.url,
    data: originalRequest.data,
    params: originalRequest.params,
    withCredentials: true, // Bắt buộc để browser gửi cookie mới
    _retry: true,
  };
};

const responseInterceptor = () => {
  axiosClient.interceptors.response.use(
    // ✅ Thành công → trả response bình thường, giảm counter
    (response) => {
      const shouldSkip = SKIP_LOADING_URLS.some((url) =>
        response.config?.url?.includes(url),
      );
      if (!shouldSkip) {
        useLoadingStore.getState().decrement();
      }
      return response;
    },

    // ❌ Lỗi → xử lý 401/refresh hoặc throw HttpError
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // ──────── Validate originalRequest ────────
      if (!originalRequest) {
        useLoadingStore.getState().decrement();
        console.error("[Interceptor] No request config found");
        throw new HttpError({
          status: 0,
          message: "Invalid request configuration",
          code: "INVALID_REQUEST",
        });
      }

      // ──────── Cancelled request (AbortController / component unmount) ────────
      if (axios.isCancel(error)) {
        // Request bị cancel chủ động — không throw error, chỉ reject với null
        const shouldSkip = SKIP_LOADING_URLS.some((url) =>
          originalRequest.url?.includes(url),
        );
        if (!shouldSkip) useLoadingStore.getState().decrement();
        return Promise.reject(null);
      }

      // ──────── Network error (no response) ────────
      if (!error.response) {
        const shouldSkip = SKIP_LOADING_URLS.some((url) =>
          originalRequest.url?.includes(url),
        );
        if (!shouldSkip) useLoadingStore.getState().decrement();
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

        // ⚠️ Decrement cho request GỐC ngay tại đây.
        // Khi retry, request mới sẽ tự increment/decrement riêng.
        // Không decrement → counter bị stuck → loading vĩnh viễn.
        const shouldSkipOriginal = SKIP_LOADING_URLS.some((url) =>
          originalRequest.url?.includes(url),
        );
        if (!shouldSkipOriginal) useLoadingStore.getState().decrement();

        // Race condition protection: Double-check isRefreshing
        if (isRefreshing) {
          return new Promise<void>((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then(() => axiosClient(buildRetryConfig(originalRequest)));
        }

        isRefreshing = true;

        try {
          // Gọi API refresh bằng fetch
          // ⚠️ cache: 'no-store' BẮT BUỘC — không có thì browser trả 304 (cached)
          // và 304 KHÔNG xử lý Set-Cookie → access_token mới không được set
          const refreshResponse = await fetch(`${ENV.API_URL}/auth/refresh-token`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",  // Tránh 304 — luôn lấy response mới từ server
          });

          if (!refreshResponse.ok) {
            throw new Error(`Refresh failed with status ${refreshResponse.status}`);
          }

          // ⏱️ Chờ browser xử lý Set-Cookie từ cross-origin response
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Refresh thành công → retry tất cả request đang chờ
          processQueue();

          return axiosClient(buildRetryConfig(originalRequest));
        } catch (refreshError) {
          console.error("[Interceptor] Token refresh FAILED:", refreshError);

          // ❌ Refresh token fail → logout và redirect login
          processQueue(refreshError);

          const isAdminRoute = window.location.pathname.startsWith('/admin');

          if (isAdminRoute) {
            const { logout } = useAdminAuthStore.getState();
            await logout();
            window.location.replace('/admin/login');
          } else {
            const { clearAuth } = useClientAuthStore.getState();
            clearAuth();
            window.location.replace('/client/login');
          }

          throw new HttpError({
            status: 401,
            message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
            code: "REFRESH_TOKEN_FAILED",
          });
        } finally {
          isRefreshing = false;
          refreshQueue = [];
        }
      }

      // ──────── Các lỗi khác → throw HttpError ────────
      const shouldSkip = SKIP_LOADING_URLS.some((url) =>
        originalRequest.url?.includes(url),
      );
      if (!shouldSkip) useLoadingStore.getState().decrement();

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
