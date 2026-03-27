import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast.hook';
import { changePassword, logoutCustomer } from '@/apis/endpointsCLIENT/customerAuth.api';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientAuthStore } from '../../stores/client-auth.store';
import { changePasswordSchema } from '../../schemas/client-change-password.schema';
import { ConfirmModal } from './ConfirmLeaveModal';


type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function SecurityForm() {
  const navigate = useNavigate();
  const { clearAuth } = useClientAuthStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChangePasswordConfirm, setShowChangePasswordConfirm] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState<ChangePasswordFormValues | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleOpenChangePasswordConfirm = handleSubmit((data) => {
    setPendingPasswordData(data);
    setShowChangePasswordConfirm(true);
  });

  const handleConfirmChangePassword = async () => {
    if (!pendingPasswordData) {
      return;
    }

    setShowChangePasswordConfirm(false);
    setIsChangingPassword(true);

    try {
      await changePassword({
        old_password: pendingPasswordData.currentPassword,
        new_password: pendingPasswordData.newPassword,
      });
      success('Đổi mật khẩu thành công!');
      reset();
      try {
        await logoutCustomer();
      } finally {
        clearAuth();
        navigate(ROUTER_URL.CLIENT_ROUTER?.LOGIN || '/client/login');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Đổi mật khẩu thất bại, vui lòng thử lại.';
      showError(msg);
    } finally {
      setIsChangingPassword(false);
      setPendingPasswordData(null);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showChangePasswordConfirm}
        title="Xác nhận đổi mật khẩu"
        description="Bạn có chắc chắn muốn đổi mật khẩu không?"
        cancelLabel="Huỷ"
        confirmLabel="Xác nhận"
        icon="lock_reset"
        iconBgClass="bg-primary/10 border border-primary/20"
        iconColorClass="text-primary"
        onCancel={() => {
          setShowChangePasswordConfirm(false);
          setPendingPasswordData(null);
        }}
        onConfirm={() => {
          void handleConfirmChangePassword();
        }}
      />

      <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
          <h3 className="text-sm font-bold text-gray-800">Bảo mật</h3>
        </div>

        <form onSubmit={handleOpenChangePasswordConfirm} className="flex flex-col gap-4">
        {/* Current Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              {...register('currentPassword')}
              className="w-full h-9 px-3 pr-9 rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showCurrent ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-500 mt-0.5">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              {...register('newPassword')}
              className="w-full h-9 px-3 pr-9 rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showNew ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-0.5">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              className="w-full h-9 px-3 pr-9 rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showConfirm ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-0.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isChangingPassword}
          className="cursor-pointer w-full py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-[#6c4830] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isChangingPassword ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Đang đổi...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">lock_reset</span>
              Đổi mật khẩu
            </>
          )}
        </button>
        </form>
      </section>
    </>
  );
}

export default SecurityForm;