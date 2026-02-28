import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import AuthCard from '@/components/ui/auth-card';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientForgotPassword } from '../hooks/use-client-forgot-password.hook';
import type { ForgotPasswordFormValues } from '../schemas/client-forgot-password.schema';

function ForgotPasswordPage() {
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const { sendResetEmail, isLoading, error: errorMessage } = useClientForgotPassword();

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    const result = await sendResetEmail(data.email);

    if (result.success) {
      success(result.message);
      // Redirect to login after sending reset email
      navigate(ROUTER_URL.CLIENT_ROUTER?.LOGIN || '/client/login');
    } else {
      showError(result.message, 'Gửi email thất bại');
    }
  };

  const footer = (
    <>
      Nhớ mật khẩu rồi?{' '}
      <a href="/client/login" className="text-[var(--cf-accent-light)] hover:text-white font-semibold transition-colors">
        Quay lại đăng nhập
      </a>
    </>
  );

  return (
    <AuthCard
      title="Quên mật khẩu"
      description="Nhập email của bạn, chúng tôi sẽ gửi mật khẩu mới ngay lập tức."
      footer={footer}
    >
      <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} error={errorMessage || ''} />
    </AuthCard>
  );
}

export default ForgotPasswordPage;