import { axiosClient } from "./axios.config";
import type {
  ApiSuccessResponse,
  HttpClient,
  HttpRequestConfig,
} from "./http.types";

// ======================== Utility ========================

/** Loại bỏ các params null/undefined/empty string trước khi gửi */
const cleanParams = <P extends Record<string, unknown>>(
  params?: P,
): Partial<P> | undefined => {
  if (!params) return undefined;

  const cleaned: Partial<P> = {};

  (Object.keys(params) as (keyof P)[]).forEach((key) => {
    const value = params[key];
    if (value !== "" && value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

// ======================== HTTP Client ========================

export const httpClient: HttpClient = {
  async get<T, P extends Record<string, unknown>>(
    config: HttpRequestConfig<never, P>,
  ): Promise<T | null> {
    const res = await axiosClient.get<ApiSuccessResponse<T>>(config.url, {
      params: cleanParams(config.params),
      headers: config.headers,
    });
    return res.data.data;
  },

  async post<T, D>(config: HttpRequestConfig<D>): Promise<T | null> {
    const res = await axiosClient.post<ApiSuccessResponse<T>>(
      config.url,
      config.data,
      { headers: config.headers },
    );
    return res.data.data;
  },

  async put<T, D>(config: HttpRequestConfig<D>): Promise<T | null> {
    const res = await axiosClient.put<ApiSuccessResponse<T>>(
      config.url,
      config.data,
      { headers: config.headers },
    );
    return res.data.data;
  },

  async patch<T, D>(config: HttpRequestConfig<D>): Promise<T | null> {
    const res = await axiosClient.patch<ApiSuccessResponse<T>>(
      config.url,
      config.data,
      { headers: config.headers },
    );
    return res.data.data;
  },

  async delete<T, P extends Record<string, unknown>>(
    config: HttpRequestConfig<never, P>,
  ): Promise<T | null> {
    const res = await axiosClient.delete<ApiSuccessResponse<T>>(config.url, {
      params: cleanParams(config.params),
      headers: config.headers,
    });
    return res.data.data;
  },
};
