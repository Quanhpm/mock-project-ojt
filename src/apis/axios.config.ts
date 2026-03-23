// import axios from "axios";
// import type { AxiosError, InternalAxiosRequestConfig } from "axios";
// import { ENV } from "@/config";
// import { HttpError, type ApiErrorResponse, API_ERROR_CODES } from "./http.types";
// import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
// import { useClientAuthStore } from "@/modules/client/auth-client/stores/client-auth.store";
// import { useLoadingStore } from "@/stores/loading.store";

// // ======================== Axios Instance ========================

// export const axiosClient = axios.create({
//   baseURL: ENV.API_URL,
//   withCredentials: true, // Cookie tự động gửi mỗi request
//   timeout: 30000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ======================== Auth Redirect Guard ========================

// /**
//  * Cờ chặn loop redirect — dùng sessionStorage vì window.location.replace
//  * sẽ full reload browser → biến JS bị reset. sessionStorage tồn tại qua reload
//  * nhưng mất khi đóng tab → đúng behavior mong muốn.
//  *
//  * Flow: interceptor detect token revoked/expired → set cờ → redirect login
//  *       → browser reload → hydrate() check cờ → SKIP gọi API → render login
//  *       → user login thành công → reset cờ
//  */
// const AUTH_REDIRECTING_KEY = "__auth_redirecting";

// export const isAuthRedirecting = () => sessionStorage.getItem(AUTH_REDIRECTING_KEY) === "true";
// export const resetAuthRedirecting = () => { sessionStorage.removeItem(AUTH_REDIRECTING_KEY); };

// // ======================== Refresh Token Queue ========================

// let isRefreshing = false;
// let refreshQueue: Array<{
//   resolve: () => void;
//   reject: (error: unknown) => void;
// }> = [];

// /** Xử lý tất cả request đang chờ sau khi refresh xong */
// const processQueue = (error: unknown = null) => {
//   refreshQueue.forEach((promise) => {
//     if (error) {
//       promise.reject(error);
//     } else {
//       promise.resolve();
//     }
//   });
//   refreshQueue = [];
// };

// // ======================== Setup Interceptors ========================

// export const setupApi = () => {
//   requestInterceptor();
//   responseInterceptor();
// };

// // ======================== Request Interceptor ========================

// /**
//  * Mỗi khi có request bắt đầu → tăng counter → hiển thị loading overlay.
//  * Các URL ngoại lệ (auth/refresh-token, auth/logout) được bỏ qua
//  * để tránh flash loading không cần thiết trong background.
//  */
// const SKIP_LOADING_URLS = ['/auth/refresh-token', '/auth/logout'];

// const requestInterceptor = () => {
//   axiosClient.interceptors.request.use(
//     (config) => {
//       const shouldSkip = SKIP_LOADING_URLS.some((url) =>
//         config.url?.includes(url),
//       );
//       if (!shouldSkip) {
//         useLoadingStore.getState().increment();
//       }
//       return config;
//     },
//     (error) => {
//       useLoadingStore.getState().decrement();
//       return Promise.reject(error);
//     },
//   );
// };

// // ======================== Response Interceptor ========================

// /**
//  * Tạo clean config mới từ originalRequest để retry.
//  * QUAN TRỌNG: KHÔNG reuse originalRequest trực tiếp vì Axios đã serialize
//  * headers cũ (bao gồm stale cookies) vào object đó. Khi tạo config mới,
//  * Axios sẽ build lại headers từ đầu và browser sẽ attach cookie mới
//  * (access_token vừa được refresh) vào retry request.
//  */
// const buildRetryConfig = (
//   originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
// ) => {
//   return {
//     method: originalRequest.method,
//     url: originalRequest.url,
//     data: originalRequest.data,
//     params: originalRequest.params,
//     withCredentials: true, // Bắt buộc để browser gửi cookie mới
//     _retry: true,
//   };
// };

// const responseInterceptor = () => {
//   axiosClient.interceptors.response.use(
//     // ✅ Thành công → trả response bình thường, giảm counter
//     (response) => {
//       const shouldSkip = SKIP_LOADING_URLS.some((url) =>
//         response.config?.url?.includes(url),
//       );
//       if (!shouldSkip) {
//         useLoadingStore.getState().decrement();
//       }
//       return response;
//     },

//     // ❌ Lỗi → xử lý 401/refresh hoặc throw HttpError
//     async (error: AxiosError<ApiErrorResponse>) => {
//       const originalRequest = error.config as InternalAxiosRequestConfig & {
//         _retry?: boolean;
//       };

//       // ──────── Validate originalRequest ────────
//       if (!originalRequest) {
//         useLoadingStore.getState().decrement();
//         console.error("[Interceptor] No request config found");
//         throw new HttpError({
//           status: 0,
//           message: "Invalid request configuration",
//           code: "INVALID_REQUEST",
//         });
//       }

//       // ──────── Cancelled request (AbortController / component unmount) ────────
//       if (axios.isCancel(error)) {
//         // Request bị cancel chủ động — không throw error, chỉ reject với null
//         const shouldSkip = SKIP_LOADING_URLS.some((url) =>
//           originalRequest.url?.includes(url),
//         );
//         if (!shouldSkip) useLoadingStore.getState().decrement();
//         return Promise.reject(null);
//       }

//       // ──────── Network error (no response) ────────
//       if (!error.response) {
//         const shouldSkip = SKIP_LOADING_URLS.some((url) =>
//           originalRequest.url?.includes(url),
//         );
//         if (!shouldSkip) useLoadingStore.getState().decrement();
//         throw new HttpError({
//           status: 0,
//           message: "Network error. Please check your connection.",
//           code: "NETWORK_ERROR",
//         });
//       }

//       const status = error.response?.status ?? 0;
//       const data = error.response?.data;
//       const errorCode = data?.code ?? data?.message ?? "";

//       // ──────── Token bị revoke → Logout ngay lập tức ────────
//       // Khi refresh token bị revoke (admin xoá session, đổi password, ...),
//       // không cần thử refresh — đẩy thẳng ra login.
//       if (
//         status === 401 &&
//         (errorCode === API_ERROR_CODES.TOKEN_REVOKED ||
//           data?.message === API_ERROR_CODES.TOKEN_REVOKED)
//       ) {
//         const shouldSkipRevoked = SKIP_LOADING_URLS.some((url) =>
//           originalRequest.url?.includes(url),
//         );
//         if (!shouldSkipRevoked) useLoadingStore.getState().decrement();

//         // Reset refresh state nếu đang refresh
//         if (isRefreshing) {
//           processQueue(new Error("Token revoked"));
//           isRefreshing = false;
//           refreshQueue = [];
//         }

//         // ⚠️ KHÔNG gọi logout() API — token đã bị revoke nên API cũng sẽ 401 → loop.
//         // Chỉ clear state local + set cờ chặn loop + redirect thẳng ra login.
//         sessionStorage.setItem(AUTH_REDIRECTING_KEY, "true");
//         const isAdminRoute = window.location.pathname.startsWith('/admin');
//         if (isAdminRoute) {
//           useAdminAuthStore.setState({
//             admin: null,
//             roles: [],
//             activeContext: null,
//             isLoggedIn: false,
//             isLoading: false,
//           });
//           window.location.replace('/admin/login');
//         } else {
//           useClientAuthStore.getState().clearAuth();
//           window.location.replace('/client/login');
//         }

//         throw new HttpError({
//           status: 401,
//           message: "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.",
//           code: "TOKEN_REVOKED",
//         });
//       }

//       // ──────── Token hết hạn → Auto Refresh ────────
//       // Only trigger refresh for ACCESS_TOKEN_EXPIRED (backend returns exact code)
//       if (
//         status === 401 &&
//         errorCode === API_ERROR_CODES.ACCESS_TOKEN_EXPIRED &&
//         !originalRequest._retry &&
//         !originalRequest.url?.includes('/auth/refresh-token')
//       )
//        {
//         // Đánh dấu request này đã retry (tránh loop vô hạn)
//         originalRequest._retry = true;

//         // ⚠️ Decrement cho request GỐC ngay tại đây.
//         // Khi retry, request mới sẽ tự increment/decrement riêng.
//         // Không decrement → counter bị stuck → loading vĩnh viễn.
//         const shouldSkipOriginal = SKIP_LOADING_URLS.some((url) =>
//           originalRequest.url?.includes(url),
//         );
//         if (!shouldSkipOriginal) useLoadingStore.getState().decrement();

//         // Race condition protection: Double-check isRefreshing
//         if (isRefreshing) {
//           return new Promise<void>((resolve, reject) => {
//             refreshQueue.push({ resolve, reject });
//           }).then(() => axiosClient(buildRetryConfig(originalRequest)));
//         }

//         isRefreshing = true;

//         try {
//           // Gọi API refresh bằng fetch
//           // ⚠️ cache: 'no-store' BẮT BUỘC — không có thì browser trả 304 (cached)
//           // và 304 KHÔNG xử lý Set-Cookie → access_token mới không được set
//           const refreshResponse = await fetch(`${ENV.API_URL}/auth/refresh-token`, {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",  // Tránh 304 — luôn lấy response mới từ server
//           });

//           if (!refreshResponse.ok) {
//             // Parse body để detect "Token has been revoked" từ refresh endpoint
//             let refreshErrorBody: { message?: string; code?: string } = {};
//             try {
//               refreshErrorBody = await refreshResponse.json();
//             } catch {
//               // Body không parse được — bỏ qua
//             }

//             const refreshMsg = refreshErrorBody?.message ?? refreshErrorBody?.code ?? "";
//             const isRevoked = refreshMsg === API_ERROR_CODES.TOKEN_REVOKED;

//             throw new Error(
//               isRevoked
//                 ? "TOKEN_REVOKED"
//                 : `Refresh failed with status ${refreshResponse.status}`,
//             );
//           }

//           // ⏱️ Chờ browser xử lý Set-Cookie từ cross-origin response
//           await new Promise((resolve) => setTimeout(resolve, 100));

//           // Refresh thành công → retry tất cả request đang chờ
//           processQueue();

//           return axiosClient(buildRetryConfig(originalRequest));
//         } catch (refreshError) {
//           console.error("[Interceptor] Token refresh FAILED:", refreshError);

//           // ❌ Refresh token fail → clear state + redirect login
//           // KHÔNG gọi logout() API — có thể cũng 401 → loop.
//           processQueue(refreshError);

//           sessionStorage.setItem(AUTH_REDIRECTING_KEY, "true");
//           const isAdminRoute = window.location.pathname.startsWith('/admin');

//           if (isAdminRoute) {
//             useAdminAuthStore.setState({
//               admin: null,
//               roles: [],
//               activeContext: null,
//               isLoggedIn: false,
//               isLoading: false,
//             });
//             window.location.replace('/admin/login');
//           } else {
//             useClientAuthStore.getState().clearAuth();
//             window.location.replace('/client/login');
//           }

//           throw new HttpError({
//             status: 401,
//             message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
//             code: "REFRESH_TOKEN_FAILED",
//           });
//         } finally {
//           isRefreshing = false;
//           refreshQueue = [];
//         }
//       }

//       // ──────── Các lỗi khác → throw HttpError ────────
//       const shouldSkip = SKIP_LOADING_URLS.some((url) =>
//         originalRequest.url?.includes(url),
//       );
//       if (!shouldSkip) useLoadingStore.getState().decrement();

//       const message =
//         data?.message ??
//         data?.errors?.[0]?.message ??
//         error.message ??
//         "Request failed";

//       throw new HttpError({
//         status,
//         message,
//         code: data?.code ?? undefined,
//         errors: data?.errors ?? undefined,
//       });
//     },
//   );
// };
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/config";
import { HttpError, type ApiErrorResponse, API_ERROR_CODES } from "./http.types";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useClientAuthStore } from "@/modules/client/auth-client/stores/client-auth.store";
import { useLoadingStore } from "@/stores/loading.store";

// ======================== Constants & Config ========================

const AUTH_REDIRECTING_KEY = "__auth_redirecting";
const ADMIN_AUTH_REFRESH_URL = "/auth/refresh-token";
const ADMIN_AUTH_LOGOUT_URL = "/auth/logout";
const CUSTOMER_AUTH_PREFIX = "/customer-auth";
const CUSTOMER_AUTH_REFRESH_URL = "/customer-auth/refresh-token";
const CUSTOMER_AUTH_LOGOUT_URL = "/customer-auth/logout";
const SKIP_LOADING_URLS = [
  ADMIN_AUTH_REFRESH_URL,
  ADMIN_AUTH_LOGOUT_URL,
  CUSTOMER_AUTH_REFRESH_URL,
  CUSTOMER_AUTH_LOGOUT_URL,
];

type AuthScope = "admin" | "client";

export const axiosClient = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupApi = () => {
  requestInterceptor();
  responseInterceptor();
};

// ======================== Auth Redirect Guard ========================

export const isAuthRedirecting = () => sessionStorage.getItem(AUTH_REDIRECTING_KEY) === "true";
export const resetAuthRedirecting = () => { sessionStorage.removeItem(AUTH_REDIRECTING_KEY); };

// ======================== State & Queue Management ========================

let isRefreshing = false;
let refreshQueue: Array<{ resolve: () => void; reject: (error: unknown) => void; }> = [];

const processQueue = (error: unknown = null) => {
  refreshQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  refreshQueue = [];
};

// ======================== Helpers ========================

const shouldSkipLoading = (url?: string) => SKIP_LOADING_URLS.some((skipUrl) => url?.includes(skipUrl));
const isAdminRoute = () => window.location.pathname.startsWith("/admin");
const isRefreshRequest = (url?: string) =>
  [ADMIN_AUTH_REFRESH_URL, CUSTOMER_AUTH_REFRESH_URL].some((refreshUrl) => url?.includes(refreshUrl));

const resolveAuthScope = (url?: string): AuthScope => {
  if (url?.includes(CUSTOMER_AUTH_PREFIX)) return "client";
  if (url?.includes("/auth")) return "admin";
  return isAdminRoute() ? "admin" : "client";
};

const getRefreshUrl = (scope: AuthScope) =>
  `${ENV.API_URL}${scope === "admin" ? ADMIN_AUTH_REFRESH_URL : CUSTOMER_AUTH_REFRESH_URL}`;

const isAccessTokenExpiredError = (
  scope: AuthScope,
  status: number,
  errorCode: string,
  message?: string | null,
) => {
  if (status !== 401) return false;

  if (scope === "client") {
    return (
      errorCode === API_ERROR_CODES.CUSTOMER_ACCESS_TOKEN_EXPIRED ||
      message === API_ERROR_CODES.CUSTOMER_ACCESS_TOKEN_EXPIRED
    );
  }

  return (
    errorCode === API_ERROR_CODES.ACCESS_TOKEN_EXPIRED ||
    message === "Access token has expired"
  );
};

const incrementLoading = (url?: string) => {
  if (!shouldSkipLoading(url)) useLoadingStore.getState().increment();
};

const decrementLoading = (url?: string) => {
  if (!shouldSkipLoading(url)) useLoadingStore.getState().decrement();
};

const forceLogout = (scope: AuthScope = resolveAuthScope()) => {
  sessionStorage.setItem(AUTH_REDIRECTING_KEY, "true");

  if (scope === "admin") {
    useAdminAuthStore.setState({ admin: null, roles: [], activeContext: null, isLoggedIn: false, isLoading: false });
    window.location.replace("/admin/login");
  } else {
    useClientAuthStore.getState().clearAuth();
    window.location.replace("/client/login");
  }
};

const buildRetryConfig = (originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) => ({
  method: originalRequest.method,
  url: originalRequest.url,
  data: originalRequest.data,
  params: originalRequest.params,
  withCredentials: true,
  _retry: true,
});

const refreshAccessToken = async (scope: AuthScope) => {
  const refreshResponse = await fetch(getRefreshUrl(scope), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    let refreshErrorBody: { message?: string; code?: string } = {};
    try { refreshErrorBody = await refreshResponse.json(); } catch { /* ignore */ }

    const isRevoked = (refreshErrorBody?.message ?? refreshErrorBody?.code) === API_ERROR_CODES.TOKEN_REVOKED;
    throw new Error(isRevoked ? "TOKEN_REVOKED" : `Refresh failed with status ${refreshResponse.status}`);
  }

  // Chờ browser xử lý Set-Cookie
  await new Promise((resolve) => setTimeout(resolve, 100));
};

// ======================== Interceptors ========================

const requestInterceptor = () => {
  axiosClient.interceptors.request.use(
    (config) => {
      incrementLoading(config.url);
      return config;
    },
    (error) => {
      useLoadingStore.getState().decrement(); // Fallback an toàn
      return Promise.reject(error);
    },
  );
};

const responseInterceptor = () => {
  axiosClient.interceptors.response.use(
    (response) => {
      decrementLoading(response.config?.url);
      return response;
    },
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const authScope = resolveAuthScope(originalRequest?.url);

      // ──────── 1. Validate & Network Errors ────────
      if (!originalRequest) {
        useLoadingStore.getState().decrement();
        throw new HttpError({ status: 0, message: "Invalid request configuration", code: "INVALID_REQUEST" });
      }

      if (axios.isCancel(error)) {
        decrementLoading(originalRequest.url);
        return Promise.reject(null);
      }

      if (!error.response) {
        decrementLoading(originalRequest.url);
        throw new HttpError({ status: 0, message: "Network error. Please check your connection.", code: "NETWORK_ERROR" });
      }

      const status = error.response.status;
      const data = error.response.data;
      const errorCode = data?.code ?? data?.message ?? "";

      // ──────── 2. Handle Token Revoked ────────
      const isTokenRevoked = status === 401 && (errorCode === API_ERROR_CODES.TOKEN_REVOKED || data?.message === API_ERROR_CODES.TOKEN_REVOKED);
      if (isTokenRevoked) {
        decrementLoading(originalRequest.url);
        
        if (isRefreshing) {
          processQueue(new Error("Token revoked"));
          isRefreshing = false;
        }

        forceLogout(authScope);
        throw new HttpError({ status: 401, message: "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.", code: "TOKEN_REVOKED" });
      }

      // ──────── 3. Handle Token Expired (Refresh) ────────
      const isAccessTokenExpired = isAccessTokenExpiredError(authScope, status, errorCode, data?.message);
      const canRetry = !originalRequest._retry && !isRefreshRequest(originalRequest.url);

      if (isAccessTokenExpired && canRetry) {
        originalRequest._retry = true;
        decrementLoading(originalRequest.url);

        if (isRefreshing) {
          return new Promise<void>((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then(() => axiosClient(buildRetryConfig(originalRequest)));
        }

        isRefreshing = true;

        try {
          await refreshAccessToken(authScope);
          processQueue();
          return axiosClient(buildRetryConfig(originalRequest));
        } catch (refreshError) {
          console.error("[Interceptor] Token refresh FAILED:", refreshError);
          processQueue(refreshError);
          forceLogout(authScope);
          
          throw new HttpError({ status: 401, message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", code: "REFRESH_TOKEN_FAILED" });
        } finally {
          isRefreshing = false;
        }
      }

      // ──────── 4. Handle General Errors ────────
      decrementLoading(originalRequest.url);
      const message = data?.message ?? data?.errors?.[0]?.message ?? error.message ?? "Request failed";

      throw new HttpError({
        status,
        message,
     code: data?.code ?? undefined,
         errors: data?.errors ?? undefined,
      });
    },
  );
};
