import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import AuthCard from '@/components/ui/auth-card';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import type { ForgotPasswordFormValues } from '../schemas/client-forgot-password.schema';

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      success(`Mật khẩu tạm thời đã được gửi đến email  ${data.email}. Vui lòng kiểm tra hộp thư và đổi mật khẩu ngay để đảm bảo an toàn.`);
      navigate(ROUTER_URL.CLIENT_ROUTER.CHANGE_PASSWORD);
    } catch {
      setErrorMessage('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
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
      <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} error={errorMessage} />
    </AuthCard>
  );
}

export default ForgotPasswordPage;