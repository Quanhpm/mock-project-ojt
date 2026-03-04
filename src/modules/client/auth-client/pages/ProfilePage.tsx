import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { useAuth } from '../context/useAuth';
import { useClientAuthStore } from '../stores/client-auth.store';
import LoadingLayout from '@/layouts/LoadingLayout';
import {
  updateCustomerProfile,
  changePassword,
  type CustomerUser,
} from '@/apis/endpointsCLIENT/customerAuth.api';

// ─────────────────────────── Cloudinary Upload ───────────────────────────

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.status}`);
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}

interface EditProfileModalProps {
  isOpen: boolean;
  profile: CustomerUser;
  onClose: () => void;
  onSaved: (updated: CustomerUser) => void;
}

function EditProfileModal({ isOpen, profile, onClose, onSaved }: EditProfileModalProps) {
  // ── Profile edit state ──
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Profile fields
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [address, setAddress] = useState(profile.address ?? '');

  // ── Avatar upload state ──
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Change password state ──
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { success, error: showError } = useToast();

  // ── Handle avatar file upload ──
  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Vui lòng chọn file ảnh hợp lệ.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Ảnh phải nhỏ hơn 5MB.');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      setAvatarUrl(url);
    } catch {
      showError('Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isEditMode) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleAvatarFile(file);
  };

  // Sync fields when profile prop changes
  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone ?? '');
    setAvatarUrl(profile.avatar_url ?? '');
    setAddress(profile.address ?? '');
  }, [profile]);

  // Reset all state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsEditMode(false);
      setProfileError('');
      setName(profile.name);
      setPhone(profile.phone ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
      setAddress(profile.address ?? '');
      setOldPassword('');
      setNewPassword('');
      setPasswordError('');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsEditMode(false);
    setProfileError('');
    onClose();
  };

  // ── Save profile ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Họ và tên là bắt buộc.');
      return;
    }
    setProfileError('');
    setIsSubmitting(true);
    try {
      const res = await updateCustomerProfile({
        id: profile.id,
        name: name.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim(),
        address: address.trim(),
      });
      const updated = res.data.data;
      success('Cập nhật hồ sơ thành công!');
      onSaved(updated);
      setIsEditMode(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Cập nhật thất bại, vui lòng thử lại.';
      setProfileError(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordError('Cả hai trường đều bắt buộc.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setPasswordError('');
    setIsChangingPassword(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Đổi mật khẩu thất bại, vui lòng thử lại.';
      setPasswordError(msg);
      showError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">

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

        {/* ══ Content ══ */}
        <div className="overflow-y-auto p-6 md:p-8 bg-white space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Left Column: Personal Details ── */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                    <h3 className="text-lg font-bold text-gray-800">Thông tin cá nhân</h3>
                  </div>

                  {/* Profile error banner */}
                  {profileError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">error</span>
                      <p className="text-sm text-red-700">{profileError}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                          person
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditMode}
                          className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                          placeholder="VD: Nguyễn Văn A"
                          required
                        />
                      </div>
                    </div>

                    {/* Email (always read-only) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Địa chỉ Email{' '}
                        <span className="text-gray-400 font-normal lowercase">(không thể thay đổi)</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                          mail
                        </span>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Số điện thoại{' '}
                        <span className="text-gray-400 font-normal lowercase">(tùy chọn)</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                          phone
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditMode}
                          className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                          placeholder="+84 xxx xxx xxxx"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Địa chỉ{' '}
                        <span className="text-gray-400 font-normal lowercase">(tùy chọn)</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                          location_on
                        </span>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={!isEditMode}
                          className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                          placeholder="123 Đường, Thành phố"
                        />
                      </div>
                    </div>

                    {/* Member Since (always read-only) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Thành viên từ
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                          calendar_today
                        </span>
                        <input
                          type="text"
                          value={new Date(profile.created_at).toLocaleDateString('vi-VN')}
                          disabled
                          className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Profile form hidden submit — triggered by footer button */}
                <button type="submit" id="profile-form-submit" className="hidden" />
              </form>
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Profile Picture */}
              <section className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-4">Ảnh đại diện</h4>
                <div className="flex flex-col items-center gap-4">

                  {/* Preview */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                      {isUploadingAvatar ? (
                        <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[32px] text-gray-300">person</span>
                      )}
                    </div>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="cursor-pointer absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-[#6c4830] transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                    )}
                  </div>

                  {/* Drop zone */}
                  {isEditMode && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer w-full rounded-xl border-2 border-dashed px-4 py-5 flex flex-col items-center gap-2 transition-all ${
                        isDragging
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                      } ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <span className="material-symbols-outlined text-[28px] text-gray-400">cloud_upload</span>
                      <p className="text-xs text-gray-500 text-center">
                        Kéo thả hoặc <span className="text-primary font-semibold">chọn file</span>
                      </p>
                      <p className="text-[10px] text-gray-400">PNG, JPG, WEBP • Tối đa 5MB</p>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {/* Current URL display when not in edit mode */}
                  {!isEditMode && avatarUrl && (
                    <p className="text-[10px] text-gray-400 text-center truncate max-w-full px-2">
                      {avatarUrl}
                    </p>
                  )}
                </div>
              </section>

              {/* Security — Change Password */}
              <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
                  <h3 className="text-sm font-bold text-gray-800">Bảo mật</h3>
                </div>

                {/* Password error banner */}
                {passwordError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <span className="material-symbols-outlined text-red-500 text-[16px] mt-0.5">error</span>
                    <p className="text-xs text-red-700">{passwordError}</p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  {/* Current Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full h-9 px-3 pr-9 rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showOldPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-9 px-3 pr-9 rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showNewPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword || !oldPassword || !newPassword}
                    className="cursor-pointer w-full py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-[#6c4830] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
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
            </div>
          </div>
        </div>

        {/* ══ Footer ══ */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
          >
            Hủy
          </button>

          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="cursor-pointer px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Bật chỉnh sửa
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => document.getElementById('profile-form-submit')?.click()}
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
        </div>
      </div>
    </div>
  );
}

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

  if (isLoggingOut) {
    return <LoadingLayout />;
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
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto space-y-8">

          {/* ══ Profile Header ══ */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Avatar + Identity */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[56px] text-gray-300">person</span>
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  title="Thay đổi ảnh"
                  className="cursor-pointer absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Name + Email + Status */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">{profile.name}</h1>
                </div>
                <p className="text-gray-500 font-medium">{profile.email}</p>
                <div className="mt-2 flex items-center justify-center md:justify-start gap-2 text-sm text-green-600">
                  {profile.is_active ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                      Đang hoạt động
                    </>
                  ) : (
                    <>
                      <span className="inline-flex rounded-full h-2 w-2 bg-gray-400" />
                      <span className="text-gray-400">Không hoạt động</span>
                    </>
                  )}
                </div>
              </div>
            </div>

          </section>

          {/* ══ Main Grid ══ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* ── Personal Information ── */}
            <div className="md:col-span-2 space-y-6">
              <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                  <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ và tên</label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm">
                      {profile.name}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa chỉ Email</label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-sm">
                      {profile.email}
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Liên hệ hỗ trợ để thay đổi email chính.</p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số điện thoại</label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm">
                      {profile.phone || <span className="text-gray-400">Chưa cung cấp</span>}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa chỉ</label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm">
                      {profile.address || <span className="text-gray-400">Chưa cung cấp</span>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-4">
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm"
                >
                  Quay về trang chủ
                </a>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-[#6c4830] shadow-sm transition-all active:scale-95 text-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="space-y-6">

              {/* Account Detail */}
              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5 border-b border-gray-100 pb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                  <h2 className="text-base font-bold text-gray-800">Chi tiết tài khoản</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Thành viên từ</p>
                    <p className="text-sm text-gray-700">
                      {new Date(profile.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trạng thái</p>
                    {profile.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Tài khoản đã xác thực
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <span className="material-symbols-outlined text-[14px]">pending</span>
                        Chờ xác thực
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Session & Security */}
              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5 text-red-500">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <h2 className="text-base font-bold">Phiên &amp; Bảo mật</h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
                  >
                    <span className="text-sm font-medium text-gray-700">Đổi mật khẩu</span>
                    <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </button>
                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full px-4 py-2.5 border border-red-400 text-red-500 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </section>

            </aside>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        profile={profile}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}

export default ProfilePage;
