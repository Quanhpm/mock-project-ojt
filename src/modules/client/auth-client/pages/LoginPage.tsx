import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { useClientAuthStore } from '../stores/client-auth.store';
import { useToast } from '@/hooks/use-toast.hook';
import mockUsers from '@/assets/customer.json';
import { ROUTER_URL } from '@/routes/router.const';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useClientAuthStore((state) => state.login);
  const { success, error: showError } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lấy route trước đó từ location.state hoặc mặc định về HOME
  const from = (location.state as { from?: string })?.from || ROUTER_URL.HOME;

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = mockUsers.customers.find((u) => u.email === data.email);

      if (!user) {
        const errMsg = 'Email không tồn tại';
        setErrorMessage(errMsg);
        showError(errMsg, 'Đăng nhập thất bại');
        return;
      }

      if (user.password_hash !== data.password) {
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

      success(`Chào mừng ${user.name}! Đăng nhập thành công`, 'Thành công');
      
      // Redirect về trang trước đó hoặc HOME
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra xem có được redirect từ route private không
  const needsLogin = !!(location.state as { from?: string })?.from;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
        <p className="text-gray-600 text-sm">Enter your details to access your account.</p>
        
        {needsLogin && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Vui lòng đăng nhập để tiếp tục
            </p>
          </div>
        )}
      </div>

      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={errorMessage} />

      <div className="pt-8 border-t border-gray-200 w-full max-w-md mx-auto">
        <p className="text-sm text-gray-600 text-center mb-8">
          Don't have an account? <a href="/client/register" className="text-orange-500 hover:text-orange-600 font-semibold">Create an Account</a>
        </p>
      </div>
    </>
  );
}

export default LoginPage;
