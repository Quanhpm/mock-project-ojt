import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { useClientAuthStore } from '../stores/client-auth.store';
import { useToast } from '@/hooks/use-toast.hook';
import mockUsers from '@/assets/customer.json';
import { ROUTER_URL } from '@/routes/router.const';

function LoginPage() {
  const navigate = useNavigate();
  const login = useClientAuthStore((state) => state.login);
  const { success, error: showError } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      navigate(ROUTER_URL.HOME);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={errorMessage} />
    </div>
  );
}

export default LoginPage;
