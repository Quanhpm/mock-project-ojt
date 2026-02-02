import { ROLE } from "@/models";
import { useAuthStore } from "@/stores/auth.store";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTER_URL } from "../router.const";

const ClientGuard = () => {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  if (!user || user.role !== ROLE.CUSTOMER) {
    return <Navigate to={ROUTER_URL.CLIENT_ROUTER.LOGIN} replace />;
  }

  return <Outlet />;
};
export default ClientGuard;
