import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { useAuth } from '../context/useAuth';
import { useClientAuthStore } from '../stores/client-auth.store';
import { type CustomerUser } from '@/apis/endpointsCLIENT/customerAuth.api';
import EditProfileModal from '../components/EditProfileModal/index';
import { ConfirmModal } from '../components/EditProfileModal/ConfirmLeaveModal';
import { FileLock, LogOut, ShieldUser } from 'lucide-react';
const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/de2dyvcb7/image/upload/v1774416364/656316159_2765483763813101_1192292787245113307_n_kr1os8.png?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExMEU4VTBtbWMxR1BqV3JJQnNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7mDjwZ2GYTsnzs9LxPUaahnkXp2BCJjlLXBWw4D10khK11nfzUFnqKzf7phw_aem_c0TH6FN1XaCmQQSHionzKw';



// ─────────────────────────── Profile Page ───────────────────────────

function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const { user: storeUser, setUser } = useClientAuthStore();
  const [profile, setProfile] = useState<CustomerUser | null>(storeUser as CustomerUser | null);
  const [isFetching] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'profile' | 'security'>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync local state when store updates
  useEffect(() => {
    if (storeUser) {
      setProfile(storeUser as CustomerUser);
    }
  }, [storeUser]);

  const handleSaved = (updated: CustomerUser) => {
    setProfile(updated);
    setUser(updated);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const result = await logout();
    if (result.success) {
      success(result.message);
      navigate(ROUTER_URL.CLIENT_ROUTER?.LOGIN || '/client/login');
    } else {
      setIsLoggingOut(false);
      showError(result.message, 'Đăng xuất thất bại');
    }
  };

  const openProfileModal = () => {
    setModalInitialTab('profile');
    setIsModalOpen(true);
  };

  const openSecurityModal = () => {
    setModalInitialTab('security');
    setIsModalOpen(true);
  };

  if (isLoggingOut) {
    return null;
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
            progress_activity
          </span>
          <p className="text-gray-500 text-sm font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="material-symbols-outlined text-gray-400 text-[48px]">person_off</span>
          <p className="text-gray-500 mt-2">Không tìm thấy thông tin người dùng.</p>
          <a href="/client" className="mt-4 inline-block text-primary font-semibold hover:underline">
            Quay về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <main className="mx-auto max-w-4xl py-2 md:py-8">
          <section className="mb-12 flex flex-col items-center gap-8 rounded-xl border border-gray-100 bg-white p-8 shadow-sm md:flex-row">
            <div className="relative group">
              <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary/20">
                {profile.avatar_url ? (
                  <img
                    src={profile?.avatar_url || DEFAULT_AVATAR_URL}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={DEFAULT_AVATAR_URL}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={openProfileModal}
                className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary p-1.5 text-white shadow-lg transform-gpu transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>

            <div className="flex-grow text-center md:text-left">
              <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-gray-900">{profile.name}</h1>
              <p className="font-medium text-gray-500">{profile.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              </div>
            </div>

            <div className="hidden md:block">
              {/* <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-full bg-primary/15 px-6 py-3 font-bold text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
              >
                Chỉnh sửa hồ sơ
              </button> */}
            </div>
          </section>

          <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group rounded-xl border border-transparent bg-white p-6 shadow-sm transition-colors hover:border-gray-200">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <span className="material-symbols-outlined text-sm">person</span>
                Họ và Tên
              </p>
              <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
            </div>

            <div className="group rounded-xl border border-transparent bg-white p-6 shadow-sm transition-colors hover:border-gray-200">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <span className="material-symbols-outlined text-sm">mail</span>
                Địa chỉ email
              </p>
              <p className="text-lg font-semibold text-gray-900">{profile.email}</p>
            </div>

            <div className="group rounded-xl border border-transparent bg-white p-6 shadow-sm transition-colors hover:border-gray-200">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <span className="material-symbols-outlined text-sm">call</span>
                Số điện thoại
              </p>
              <p className="text-lg font-semibold text-gray-900">{profile.phone || 'Chưa cung cấp'}</p>
            </div>

            <div className="group rounded-xl border border-transparent bg-white p-6 shadow-sm transition-colors hover:border-gray-200">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Địa chỉ
              </p>
              <p className="text-lg font-semibold leading-snug text-gray-900">{profile.address || 'Chưa cung cấp'}</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 px-2 text-xl font-extrabold">
              <ShieldUser className="h-6 w-6 text-primary" />
              Quyền riêng tư &amp; Bảo mật
            </h2>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <button
                onClick={openSecurityModal}
                className="group flex w-full items-center justify-between p-6 text-left transform-gpu transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileLock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Đổi mật khẩu</p>
                    <p className="text-sm text-gray-500">Cập nhật mật khẩu để bảo mật tài khoản</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-400 transition-transform group-hover:translate-x-1">
                  chevron_right
                </span>
              </button>

              <div className="px-6">
                <div className="h-px bg-gray-100" />
              </div>

              <div className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Đăng xuất</p>
                    <p className="text-sm text-gray-500">Rời khỏi phiên làm việc hiện tại</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="rounded-full border-2 border-red-400 px-6 py-2 text-sm font-bold text-red-500 transform-gpu transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-lg active:scale-95 md:text-base"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </section>

          <footer className="flex flex-col items-center justify-end gap-4 border-t border-gray-200 py-8 sm:flex-row">
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-full border-2 border-gray-300 px-8 py-3 font-bold text-gray-600 transform-gpu transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-md active:scale-95 sm:w-auto"
            >
              Quay về trang chủ
            </button>
            <button
              onClick={openProfileModal}
              className="w-full rounded-full bg-primary px-10 py-3 font-bold text-white shadow-lg shadow-primary/20 transform-gpu transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#8a6143] hover:shadow-xl hover:shadow-primary/30 active:scale-95 sm:w-auto"
            >
              Chỉnh sửa hồ sơ
            </button>
          </footer>
        </main>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        initialTab={modalInitialTab}
        profile={profile}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc muốn đăng xuất khỏi tài khoản hiện tại không?"
        cancelLabel="Ở lại"
        confirmLabel="Đăng xuất"
        icon="logout"
        iconBgClass="bg-red-50 border border-red-200"
        iconColorClass="text-red-500"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          void handleLogout();
        }}
      />
    </>
  );
}

export default ProfilePage;
