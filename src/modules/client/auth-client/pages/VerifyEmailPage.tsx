import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthCard from '@/components/ui/auth-card';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientVerifyEmail } from '../hooks/use-client-verify-email.hook';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { verify, error } = useClientVerifyEmail();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      showError('Token xác thực không hợp lệ', 'Lỗi');
      setVerificationStatus('error');
      return;
    }

    const verifyToken = async () => {
      const result = await verify(token);

      if (result.success) {
        setVerificationStatus('success');
        success(result.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate(ROUTER_URL.CLIENT_ROUTER?.LOGIN || '/client/login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        showError(result.message, 'Xác thực thất bại');
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const footer = (
    <>
      <a
        href="/client/login"
        className="text-[var(--cf-accent-light)] hover:text-white font-semibold transition-colors"
      >
        Quay lại đăng nhập
      </a>
    </>
  );

  return (
    <AuthCard
      title="Xác thực email"
      description=""
      footer={footer}
    >
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        {verificationStatus === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <p className="text-white/70">Đang xác thực email của bạn...</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-white text-lg font-semibold">Xác thực thành công!</p>
            <p className="text-white/70 text-sm text-center">
              Email của bạn đã được xác thực thành công.<br />
              Đang chuyển hướng đến trang đăng nhập...
            </p>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500" />
            <p className="text-white text-lg font-semibold">Xác thực thất bại</p>
            <p className="text-white/70 text-sm text-center">
              {error || 'Token xác thực không hợp lệ hoặc đã hết hạn'}
            </p>
            <button
              onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER?.LOGIN || '/client/login')}
              className="mt-4 px-6 py-2 bg-[var(--cf-accent)] hover:bg-[var(--cf-accent-light)] text-white rounded-lg transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default VerifyEmailPage;
