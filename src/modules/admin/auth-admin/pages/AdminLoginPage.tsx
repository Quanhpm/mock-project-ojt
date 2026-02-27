import { AdminLoginForm } from "../components/AdminLoginForm";
import { useAdminLogin } from "../hooks/use-admin-login.hook";

export default function AdminLoginPage() {
  const { handleLogin, loading, errorMessage } = useAdminLogin();

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
