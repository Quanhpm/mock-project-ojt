import { Navigate, Outlet } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";

/**
 * AdminGuard - Protect admin routes
 * Only allow users with valid admin role to access
 */
const AdminGuard = () => {
  const { admin, roleCode } = useAdminAuthStore();

  // If no admin or roleCode, redirect to admin login
  if (!admin || !roleCode) {
    return <Navigate to={ROUTER_URL.ADMIN_ROUTER.LOGIN} replace />;
  }

  // Allow access to protected routes
  return <Outlet />;
};

export default AdminGuard;
