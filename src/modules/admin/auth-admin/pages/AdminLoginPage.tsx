import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLoginForm } from "../components/AdminLoginForm";
import { useAdminLogin } from "../hooks/use-admin-login.hook";
import { useAdminAuthStore, getRoleCode } from "../stores/admin-auth.store";
import { ROUTER_URL } from "@/routes/router.const";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { handleLogin, loading, errorMessage } = useAdminLogin();
  
  // ✅ Check if user is already logged in
  const store = useAdminAuthStore();
  const roleCode = getRoleCode(store);
  const isLoggedIn = !!(store.admin && roleCode);
  const isLoading = store.isLoading;
  
  const activeContext = store.activeContext;

  // ✅ Auto-redirect if already logged in AND hydrate is done
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      // Nếu đã có active_context (session cũ còn sống) → vào dashboard thẳng
      // Nếu chưa có context → bắt buộc chọn franchise
      if (activeContext) {
        navigate(
          `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`,
          { replace: true }
        );
      } else {
        navigate(
          `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.SELECT_FRANCHISE}`,
          { replace: true }
        );
      }
    }
  }, [isLoggedIn, isLoading, activeContext, navigate]);

  // ✅ Don't render login form if already logged in AND hydrate done
  if (isLoggedIn && !isLoading) {
    return null;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Sign In</h1>
        <p className="text-gray-600 text-sm">Enter your admin credentials to access the management panel.</p>
      </div>

      <AdminLoginForm 
        onSubmit={handleLogin} 
        isLoading={false}
        error={errorMessage} 
      />

      <div className="pt-8 border-t border-gray-200 w-full max-w-md mx-auto">
        <p className="text-sm text-gray-600 text-center mb-8">
          Forgot your password? <a href="/admin/forgot-password" className="text-orange-500 hover:text-orange-600 font-semibold">Reset Password</a>
        </p>
      </div>
    </>
  );
}
