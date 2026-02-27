import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import AuthCard from '@/components/ui/auth-card';
import { useClientAuthStore } from '../stores/client-auth.store';
import { useToast } from '@/hooks/use-toast.hook';
import customers from '@/mockdata/customers.json';
import { ROUTER_URL } from '@/routes/router.const';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setAuthLoading } = useClientAuthStore();
  const { success, error: showError } = useToast();
  const [errorMessage, setErrorMessage] = useState('');

  // Lấy route trước đó từ location.state hoặc mặc định về HOME
  const from = (location.state as { from?: string })?.from || ROUTER_URL.HOME;

  const handleLogin = async (data: { email: string; password: string }) => {
    setAuthLoading(true);
    setErrorMessage('');

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = customers.find((u) => u.email === data.email);

      if (!user) {
        const errMsg = 'Email không tồn tại';
        setErrorMessage(errMsg);
        showError(errMsg, 'Đăng nhập thất bại');
        return;
      }

      if (user.password !== data.password) {
        const errMsg = 'Mật khẩu không chính xác';
        setErrorMessage(errMsg);
        showError(errMsg, 'Đăng nhập thất bại');
        return;
      }

      login({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        is_deleted: user.is_deleted,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });

      success(`Chào mừng ${user.name}! Đăng nhập thành công`);
      
      // Redirect về trang trước đó hoặc HOME
      navigate(from, { replace: true });
    } finally {
      setAuthLoading(false);
    }
  };

  const needsLogin = !!(location.state as { from?: string })?.from;

  const footer = (
    <>
      Không có tài khoản{' '}
      <a href="/client/register" className="text-[var(--cf-accent-light)] hover:text-white font-semibold transition-colors">
        Tạo tài khoản mới
      </a>
    </>
  );

  return (
    <AuthCard
      title="Chào mừng trở lại!"
      description=""
      footer={footer}
    >
      {needsLogin && (
        <div className="mb-5 p-3 rounded-xl bg-yellow-400/20 border border-yellow-400/30">
          <p className="text-sm text-yellow-200">⚠️ Vui lòng đăng nhập để tiếp tục</p>
        </div>
      )}
      <LoginForm onSubmit={handleLogin} isLoading={false} error={errorMessage} />
    </AuthCard>
  );
}

export default LoginPage;
