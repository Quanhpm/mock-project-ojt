import { useState } from "react";
import { loginCustomer, getCustomerProfile } from "@/apis/endpointsCLIENT";
import { useClientAuthStore } from "../stores/client-auth.store";
import { HttpError } from "@/apis";
import type { CustomerLoginRequest } from "@/apis/endpointsCLIENT/customerAuth.api";

export const useClientLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setAuthLoading } = useClientAuthStore();

  const login = async (data: CustomerLoginRequest) => {
    setIsLoading(true);
    setAuthLoading(true);
    setError(null);

    try {
      const response = await loginCustomer(data);

      // Backend trả { success: true, data: null } — token set qua cookie
      // Gọi getCustomerProfile để lấy thông tin user sau khi cookie được set
      if (!response.data?.success) {
        throw new Error("Đăng nhập thất bại");
      }

      const profileRes = await getCustomerProfile();
      const userData = profileRes.data?.data;

      if (!userData) {
        throw new Error("Không thể tải thông tin người dùng");
      }

      // Set user in store
      setUser(userData);

      return {
        success: true,
        user: userData,
        message: "Đăng nhập thành công",
      };
    } catch (err) {
      console.error("❌ Login Error:", err);
      
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Đăng nhập thất bại. Vui lòng thử lại.";
      
      setError(errorMessage);
      
      return {
        success: false,
        user: null,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
      setAuthLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
