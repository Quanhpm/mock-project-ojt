import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast.hook';
import {
  updateCustomerProfile,
  type CustomerUser,
} from '@/apis/endpointsCLIENT/customerAuth.api';
import SecurityForm from './SecurityForm';
import { ConfirmModal } from './ConfirmLeaveModal';
import { ProfileTabContent } from './ProfileTabContent';
import { editProfileSchema, type EditProfileFormValues } from '../../schemas/client-edit-profile.schema';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: CustomerUser;
  onClose: () => void;
  onSaved: (updated: CustomerUser) => void;
  initialTab?: Tab;
}

type Tab = 'profile' | 'security';

function EditProfileModal({ isOpen, profile, onClose, onSaved, initialTab = 'profile' }: EditProfileModalProps) {
  // ── Profile edit state ──
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const { success, error: showError } = useToast();

  const methods = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      avatar_url: profile.avatar_url ?? '',
    },
  });

  const {
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isDirty, isSubmitting },
  } = methods;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: profile.name,
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        avatar_url: profile.avatar_url ?? '',
      });
      setIsEditMode(false);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab, profile, reset]);

  if (!isOpen) return null;

  const doClose = () => {
    reset({
      name: profile.name,
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      avatar_url: profile.avatar_url ?? '',
    });
    setIsEditMode(false);
    setShowConfirm(false);
    onClose();
  };

  const handleClose = () => {
    if (isDirty) { setShowConfirm(true); return; }
    doClose();
  };

  // ── Save profile ──
  const handleSaveProfile = handleSubmit(async (data) => {
    setShowSaveConfirm(false);
    try {
      const updated = await updateCustomerProfile({
        id: profile.id,
        name: data.name.trim(),
        phone: (data.phone ?? '').trim(),
        avatar_url: (data.avatar_url ?? '').trim(),
        address: (data.address ?? '').trim(),
      });
      if (!updated) throw new Error('Không nhận được dữ liệu từ server.');
      success('Cập nhật hồ sơ thành công!');
      onSaved(updated);
      setIsEditMode(false);
      reset(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Cập nhật thất bại, vui lòng thử lại.';
      setError('root', { message: msg });
      showError(msg);
    }
  });

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title="Bạn có thay đổi chưa lưu"
        description="Nếu rời đi lúc này, các thay đổi bạn đã thực hiện sẽ không được lưu lại."
        cancelLabel="Tiếp tục chỉnh sửa"
        confirmLabel="Rời khỏi"
        icon="warning"
        iconBgClass="bg-amber-50 border border-amber-200"
        iconColorClass="text-amber-500"
        onCancel={() => setShowConfirm(false)}
        onConfirm={doClose}
      />

      <ConfirmModal
        isOpen={showSaveConfirm}
        title="Xác nhận lưu thay đổi"
        description="Bạn có chắc muốn cập nhật thông tin hồ sơ không?"
        cancelLabel="Huỷ"
        confirmLabel="Lưu"
        icon="save"
        iconBgClass="bg-primary/10 border border-primary/20"
        iconColorClass="text-primary"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={() => document.getElementById('profile-form-submit')?.click()}
      />

      <div
        className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      >
      <div
        className="modal-panel-enter w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ══ Header ══ */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              Chỉnh sửa hồ sơ
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật thông tin cá nhân và bảo mật tài khoản.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* ══ Tab Bar ══ */}
        <div className="flex border-b border-gray-100 bg-white px-6">
          {([
            { key: 'profile', label: 'Thông tin cá nhân', icon: 'person' },
            { key: 'security', label: 'Bảo mật', icon: 'lock' },
          ] as { key: Tab; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ Content ══ */}
        <FormProvider {...methods}>
          <div className="overflow-y-auto p-6 md:p-8 bg-white space-y-8">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <ProfileTabContent
                  isEditMode={isEditMode}
                  email={profile.email}
                  createdAt={new Date(profile.created_at).toLocaleDateString('vi-VN')}
                />
                <button type="submit" id="profile-form-submit" className="hidden" />
              </form>
            )}
            {activeTab === 'security' && <SecurityForm />}
          </div>
        </FormProvider>

        {/* ══ Footer ══ */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
          >
            Hủy
          </button>

          {activeTab === 'profile' && (
            <>
              {!isEditMode ? (
                <button
                  type="button"
                  onClick={() => { setIsEditMode(true); setTimeout(() => setFocus('name'), 0); }}
                  className="cursor-pointer px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Bật chỉnh sửa
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || !isDirty}
                  onClick={() => setShowSaveConfirm(true)}
                  className="cursor-pointer px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default EditProfileModal;
