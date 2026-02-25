import { Navigate } from "react-router-dom";
import { hasPermission } from "@/config/permissions.config";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";

interface ProtectedRouteProps {
  requiredModule: string;
  element: React.ReactNode;
}


export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredModule, 
  element 
}) => {
  const { roleCode } = useAdminAuthStore();
  
  if (!roleCode || !hasPermission(roleCode, requiredModule)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{element}</>;
};

export default ProtectedRoute;
