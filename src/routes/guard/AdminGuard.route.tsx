import { isNonCustomerRole } from "@/models";
import { useAuthStore } from "@/stores/auth.store";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTER_URL } from "../router.const";

const AdminGuard = () => {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return null;
  }

  if (!user || !isNonCustomerRole(user.role)) {
    return <Navigate to={ROUTER_URL.CLIENT_ROUTER.LOGIN} replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
