import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
import AuthCard from '@/components/ui/auth-card';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientChangePassword } from '../hooks/use-client-change-password.hook';
import type { ChangePasswordFormValues } from '../schemas/client-change-password.schema';

function ChangePasswordPage() {
  const { updatePassword, isLoading, error } = useClientChangePassword();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: ChangePasswordFormValues) => {
    // Map form data to API request format (snake_case for backend)
    const result = await updatePassword({
      old_password: data.currentPassword,
      new_password: data.newPassword,
    });

    if (result.success) {
      success(result.message);
      // Redirect to login after successful password change
      setTimeout(() => {
        navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
      }, 1500);
    } else {
      showError(result.message);
    }
  };

  const footer = (
    <>
      Quay lại{' '}
      <a href="/client/login" className="text-[var(--cf-accent-light)] hover:text-white font-semibold transition-colors">
        Đăng nhập
      </a>
    </>
  );

  return (
    <AuthCard
      title="Đổi mật khẩu"
      description=""
      footer={footer}
    >
      <ChangePasswordForm onSubmit={handleSubmit} isLoading={isLoading} error={error || ''} />
    </AuthCard>
  );
}

export default ChangePasswordPage;