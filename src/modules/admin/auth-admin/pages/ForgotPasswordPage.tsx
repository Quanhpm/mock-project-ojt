import { useNavigate } from "react-router-dom";
import { AdminForgotPasswordForm } from "../components/AdminForgotPasswordForm";
import { useToast } from "@/hooks/use-toast.hook";
import { ROUTER_URL } from "@/routes/router.const";
import { useAdminForgotPassword } from "../hooks/use-admin-forgot-password.hook";
import type { AdminForgotPasswordFormValues } from "../schemas/admin-forgot-password.schema";

export default function ForgotPasswordPage() {
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const {
    sendResetEmail,
    isLoading,
    error: errorMessage,
  } = useAdminForgotPassword();

  const handleSubmit = async (data: AdminForgotPasswordFormValues) => {
    const result = await sendResetEmail(data.email);

    if (result.success) {
      success(result.message);
      // Redirect về trang login sau 2 giây
      setTimeout(() => {
        navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN);
      }, 2000);
    } else {
      showError(result.message, "Gửi email thất bại");
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Forgot Password
        </h1>
        <p className="text-gray-600 text-sm">
          Enter your admin email address and we'll send you a new password.
        </p>
      </div>

      <AdminForgotPasswordForm
        onSubmit={handleSubmit}
        isLoading={false}
        error={errorMessage || ""}
      />

      <div className="pt-8 border-t border-gray-200 w-full max-w-md mx-auto">
        <p className="text-sm text-gray-600 text-center">
          Remember your password?{" "}
          <a
            href="/admin/login"
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            Back to Login
          </a>
        </p>
      </div>
    </>
  );
}
