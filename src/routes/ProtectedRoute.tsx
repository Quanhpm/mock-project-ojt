import { Navigate } from "react-router-dom";
import { hasPermission, type RoleCode } from "@/config/permissions.config";
import { useAdminAuthStore, getRoleCode } from "@/modules/admin/auth-admin/stores/admin-auth.store";

interface ProtectedRouteProps {
  requiredModule: string;
  element: React.ReactNode;
  allowedRoles?: RoleCode[];
}


export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredModule, 
  element,
  allowedRoles,
}) => {
  const store = useAdminAuthStore();
  const roleCode = getRoleCode(store);
  
  if (!roleCode || !hasPermission(roleCode, requiredModule)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(roleCode)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{element}</>;
};

export default ProtectedRoute;
