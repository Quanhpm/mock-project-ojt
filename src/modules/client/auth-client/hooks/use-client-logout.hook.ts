import { useCallback } from "react";
import { logoutCustomer } from "@/apis/endpointsCLIENT";
import { useClientAuthStore } from "../stores/client-auth.store";
import { useLoadingStore } from "@/stores/loading.store";
import { HttpError } from "@/apis";

export const useClientLogout = () => {
  const { clearAuth } = useClientAuthStore();
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore();

  const logout = useCallback(async () => {
    incrementGlobalLoading();
    
    try {
      // Gọi logout API để server xóa cookie
      await logoutCustomer();
    } catch (err) {
      console.warn("⚠️ Logout API Error:", err);
      // Vẫn clear auth store ngay cả khi API fail (token có thể đã hết hạn)
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Có lỗi khi đăng xuất";
      console.log(errorMessage);
    } finally {
      // Luôn clear auth state sau logout
      clearAuth();
      decrementGlobalLoading();
    }
  }, [clearAuth, incrementGlobalLoading, decrementGlobalLoading]);

  return { logout };
};
