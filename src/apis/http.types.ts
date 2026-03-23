// ======================== API Response Wrappers ========================

/** Response wrapper khi API trả về thành công */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T | null;
}

// ======================== API Error Constants ========================

/** Constants cho các error codes từ backend */
export const API_ERROR_CODES = {
  ACCESS_TOKEN_EXPIRED: "ACCESS_TOKEN_EXPIRED",
  CUSTOMER_ACCESS_TOKEN_EXPIRED: "CUSTOMER_ACCESS_TOKEN_EXPIRED",
  REFRESH_TOKEN_FAILED: "REFRESH_TOKEN_FAILED",
  TOKEN_REVOKED: "Token has been revoked",
  NETWORK_ERROR: "NETWORK_ERROR",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
} as const;

/** Thông tin phân trang trả về từ Search API */
export interface PageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Response wrapper cho Search API — bao gồm data + pageInfo */
export interface SearchResponse<T> {
  success: true;
  data: T[];
  pageInfo: PageInfo;
}

/** Response wrapper khi API trả về lỗi */
export interface ApiErrorResponse {
  success: false;
  message?: string | null;
  code?: string | null;
  errors?: ApiErrorItem[] | null;
}

/** Chi tiết từng lỗi validation */
export interface ApiErrorItem {
  message: string;
  field?: string;
}

// ======================== HTTP Client Types ========================

/** Config chung cho mọi request */
export interface HttpRequestConfig<
  TData = unknown,
  TParams extends Record<string, unknown> = Record<string, unknown>,
> {
  url: string;
  data?: TData;
  params?: TParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** Interface cho httpClient — tất cả HTTP methods */
export interface HttpClient {
  get<T, P extends Record<string, unknown> = Record<string, unknown>>(
    config: HttpRequestConfig<never, P>,
  ): Promise<T | null>;

  post<T, D = unknown>(config: HttpRequestConfig<D>): Promise<T | null>;

  put<T, D = unknown>(config: HttpRequestConfig<D>): Promise<T | null>;

  patch<T, D = unknown>(config: HttpRequestConfig<D>): Promise<T | null>;

  delete<T, P extends Record<string, unknown> = Record<string, unknown>>(
    config: HttpRequestConfig<never, P>,
  ): Promise<T | null>;

  /** Search API — trả về toàn bộ body (data + pageInfo) thay vì chỉ data */
  search<T, D = unknown>(
    config: HttpRequestConfig<D>,
  ): Promise<SearchResponse<T>>;
}

// ======================== Custom Error Class ========================

/** Custom HTTP Error — throw từ response interceptor */
export class HttpError extends Error {
  status: number;
  code?: string;
  errors?: ApiErrorItem[];

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    errors?: ApiErrorItem[];
  }) {
    super(params.message);
    this.name = "HttpError";
    this.status = params.status;
    this.code = params.code;
    this.errors = params.errors;
  }
}
