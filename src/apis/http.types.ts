// ======================== API Response Wrappers ========================

/** Response wrapper khi API trả về thành công */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T | null;
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
