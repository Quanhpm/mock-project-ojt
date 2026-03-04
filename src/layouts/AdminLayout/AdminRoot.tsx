import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { GlobalLoadingOverlay } from "@/components/GlobalLoadingOverlay";
import { HttpError } from "@/apis/http.types";
import { ROUTER_URL } from "@/routes/router.const";

/**
 * AdminRoot — wrapper cho toàn bộ admin routes.
 * Chỉ chạy adminHydrate khi người dùng truy cập /admin/*
 * Không ảnh hưởng gì tới client side.
 */
function AdminRoot() {
  const adminHydrate = useAdminAuthStore((state) => state.hydrate);
  const adminIsLoading = useAdminAuthStore((state) => state.isLoading);

  useEffect(() => {
    adminHydrate().catch((error) => {
      if (error instanceof HttpError && error.code === "REFRESH_TOKEN_FAILED") {
        window.location.href = ROUTER_URL.ADMIN_ROUTER.LOGIN;
      }
    });
  }, [adminHydrate]);

  if (adminIsLoading) {
    return <GlobalLoadingOverlay forceShow />;
  }

  return <Outlet />;
}

export default AdminRoot;
