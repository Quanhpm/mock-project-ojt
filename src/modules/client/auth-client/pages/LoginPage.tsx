import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import AuthCard from '@/components/ui/auth-card';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientLogin } from '../hooks/use-client-login.hook';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useToast();
  const { login, isLoading, error: errorMessage } = useClientLogin();

  // Lấy route trước đó từ location.state hoặc mặc định về HOME
  const from = (location.state as { from?: string })?.from || ROUTER_URL.HOME;

  const handleLogin = async (data: { email: string; password: string }) => {
    const result = await login(data);

    if (result.success && result.user) {
      success(`Chào mừng ${result.user.name}! Đăng nhập thành công`);
      
      // Redirect về trang trước đó hoặc HOME
      navigate(from, { replace: true });
    } else {
      showError(result.message, 'Đăng nhập thất bại');
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
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={errorMessage || ''} />
    </AuthCard>
  );
}

export default LoginPage;