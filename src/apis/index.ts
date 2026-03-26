// Setup interceptors (gọi 1 lần ở main.tsx)
export { setupApi, isAuthRedirecting, resetAuthRedirecting } from "./axios.config";

// HTTP Client (dùng trong endpoint files)
export { httpClient } from "./httpClient";

// Types (dùng khi cần handle error)
export { HttpError } from "./http.types";
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorItem,
  HttpRequestConfig,
  SearchResponse,
  PageInfo,
} from "./http.types";

// API Endpoints
export * from "./endpoints";
export {
  getCustomerProfile,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  updateCustomerProfile,
} from "./endpointsCLIENT/customerAuth.api";
export type {
  CustomerChangePasswordRequest,
  CustomerForgotPasswordRequest,
  CustomerLoginRequest,
  CustomerRegisterRequest,
  CustomerUser,
  CustomerVerifyEmailRequest,
} from "./endpointsCLIENT/customerAuth.api";
export { getFranchiseDetail } from "./endpointsCLIENT/franchiseDetail.api";
export type { FranchiseDetailResponse } from "./endpointsCLIENT/franchiseDetail.api";
export * from "./endpointsCLIENT/loyalty.api";
export * from "./endpointsCLIENT/order.api";
export * from "./endpointsCLIENT/productDetail.api";
