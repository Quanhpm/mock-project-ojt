import { useCallback } from "react";
import { useAdminAuthStore } from "../stores/admin-auth.store";
import { useLoadingStore } from "@/stores/loading.store";

/**
 * Hook admin logout dengan global loading management
 * - Gọi logout API từ store
 * - Trigger global loading spinner
 * - Clear admin auth state
 */
export const useAdminLogout = () => {
  const { logout: storeLogout } = useAdminAuthStore();
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore();

  const logout = useCallback(async () => {
    incrementGlobalLoading();
    
    try {
      // Gọi logout từ store (gọi API + clear state)
      await storeLogout();
    } catch (err) {
      console.warn("⚠️ Admin Logout Error:", err);
      // Vẫn clear state ngay cả khi error (token có thể đã hết hạn)
    } finally {
      decrementGlobalLoading();
    }
  }, [storeLogout, incrementGlobalLoading, decrementGlobalLoading]);

  return { logout };
};
