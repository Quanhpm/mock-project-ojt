import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import AuthCard from '@/components/ui/auth-card';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { LogOut, User, Mail, Phone, Calendar } from 'lucide-react';

function ProfilePage() {
  const { user, logout, refreshProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const handleLogout = async () => {
    const result = await logout();
    
    if (result.success) {
      success(result.message);
      navigate(ROUTER_URL.CLIENT_ROUTER?.LOGIN || '/client/login');
    } else {
      showError(result.message, 'Đăng xuất thất bại');
    }
  };

  const handleRefreshProfile = async () => {
    const result = await refreshProfile();
    
    if (result.success) {
      success('Làm mới thông tin thành công');
    } else {
      showError('Làm mới thông tin thất bại');
    }
  };

  if (!user) {
    return (
      <AuthCard title="Thông tin tài khoản" description="" footer={<></>}>
        <div className="text-center py-8 text-white/70">
          Không tìm thấy thông tin người dùng
        </div>
      </AuthCard>
    );
  }

  const footer = (
    <>
      <a
        href="/client"
        className="text-[var(--cf-accent-light)] hover:text-white font-semibold transition-colors"
      >
        Quay về trang chủ
      </a>
    </>
  );

  return (
    <AuthCard
      title="Thông tin tài khoản"
      description=""
      footer={footer}
    >
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={40} />
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <User size={18} className="text-blue-400" />
            <div>
              <p className="text-xs text-white/50">Họ và tên</p>
              <p className="text-white font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <Mail size={18} className="text-green-400" />
            <div>
              <p className="text-xs text-white/50">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <Phone size={18} className="text-purple-400" />
            <div>
              <p className="text-xs text-white/50">Số điện thoại</p>
              <p className="text-white font-medium">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <Calendar size={18} className="text-orange-400" />
            <div>
              <p className="text-xs text-white/50">Ngày tạo</p>
              <p className="text-white font-medium">
                {new Date(user.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 mt-6">
          <button
            onClick={handleRefreshProfile}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Đang tải...' : 'Làm mới thông tin'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>
    </AuthCard>
  );
}

export default ProfilePage;
