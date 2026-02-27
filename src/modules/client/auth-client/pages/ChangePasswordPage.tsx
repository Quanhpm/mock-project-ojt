import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
import AuthCard from '@/components/ui/auth-card';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import type { ChangePasswordFormValues } from '../schemas/client-change-password.schema';

function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (_data: ChangePasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      success('Đặt mật khẩu mới thành công!');
      navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
    } catch {
      setErrorMessage('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
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
      <ChangePasswordForm onSubmit={handleSubmit} isLoading={isLoading} error={errorMessage} />
    </AuthCard>
  );
}

export default ChangePasswordPage;