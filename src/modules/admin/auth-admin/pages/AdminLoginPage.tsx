import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUsers } from "@/mockdata";
import { ROUTER_URL } from "@/routes/router.const";
import { useAdminAuthStore } from "../stores/admin-auth.store";
import { useToast } from "@/hooks/use-toast.hook";
import type { UserAccount, RoleType } from "@/types";
import { AdminLoginForm } from "../components/AdminLoginForm";
import { type AdminLoginFormValues } from "../schemas/admin-login.schema";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAdmin = useAdminAuthStore((s) => s.setAdmin);
  const { success, error: showError } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: AdminLoginFormValues) => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const admin = mockUsers.find(
        (u) =>
          u.email === data.email &&
          u.password === data.password &&
          u.is_active &&
          !u.is_deleted &&
          ["GLOBAL_ADMIN", "FRANCHISE_MANAGER", "STAFF", "WAREHOUSE"].includes(u.role)
      );

      if (!admin) {
        const errMsg = "Email hoặc mật khẩu không chính xác";
        setErrorMessage(errMsg);
        showError(errMsg, "Đăng nhập thất bại");
        return;
      }

      // Transform admin data to UserAccount format
      const userAccount: UserAccount = {
        id: admin.id,
        role: admin.role as RoleType,
        email: admin.email,
      };

      setAdmin(userAccount);
      success(`Chào mừng! Đăng nhập thành công`);

      setTimeout(() => {
        const targetPath = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`;
        navigate(targetPath, { replace: true });
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Sign In</h1>
        <p className="text-gray-600 text-sm">Enter your admin credentials to access the management panel.</p>
      </div>

      <AdminLoginForm 
        onSubmit={handleLogin} 
        isLoading={loading} 
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
