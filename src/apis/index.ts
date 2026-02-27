// Setup interceptors (gọi 1 lần ở main.tsx)
export { setupApi } from "./axios.config";

// HTTP Client (dùng trong endpoint files)
export { httpClient } from "./httpClient";

// Types (dùng khi cần handle error)
export { HttpError } from "./http.types";
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorItem,
  HttpRequestConfig,
} from "./http.types";

// API Endpoints
export * from "./endpoints";
export * from "./endpointsCLIENT";
