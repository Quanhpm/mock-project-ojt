import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Camera,
  Key,
  Phone,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useUpdateProfile } from "./hooks/use-update-profile.hook";
import { ROUTER_URL } from "@/routes/router.const";

// ==================== INTERFACES ====================
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: string;
}

// ==================== REUSABLE COMPONENTS ====================

interface LabeledInputWithIconProps {
  label: string;
  icon: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  helperText?: string;
  error?: string;
  name?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  // Props for react-hook-form integration
  onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const LabeledInputWithIcon: React.FC<LabeledInputWithIconProps> = ({
  label,
  icon,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
  required = false,
  minLength,
  rightIcon,
  onRightIconClick,
  helperText,
  error,
  name,
  inputRef,
  onInputChange,
  onBlur,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800">
          {icon}
        </div>
        <input
          ref={inputRef}
          name={name}
          type={type}
          value={value}
          onChange={
            onInputChange ||
            (onChange ? (e) => onChange(e.target.value) : undefined)
          }
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={`
            w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200
            ${
              disabled
                ? "bg-stone-50 border-stone-200 text-gray-500 cursor-not-allowed"
                : error
                  ? "bg-white border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                  : "bg-white border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            }
          `}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-700 transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-amber-700 ml-1">{helperText}</p>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  // ==================== Zustand Store ====================
  const { admin, roles, hydrate } = useAdminAuthStore();

  // ==================== Profile State ====================
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
    role: "",
  });

  // Đồng bộ state từ Zustand store khi admin thay đổi
  useEffect(() => {
    if (admin) {
      const roleLabel = roles.length > 0 ? roles[0].role : "User";
      setUserProfile({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        avatar_url: admin.avatar_url || "",
        role: roleLabel,
      });
    }
  }, [admin, roles]);

  // ==================== Avatar Upload State ====================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);

  // Hooks
  const { success, error: showError } = useToast();
  const { changePassword, isLoading: isChangingPassword } = useChangePassword();
  const { updateProfile, isLoading: isUpdatingProfile, isUploading, uploadAvatar } =
    useUpdateProfile();

  // UI state
  const [isEditing, setIsEditing] = useState(false);

  // ==================== Handlers ====================

  /** Xử lý chọn file ảnh → tự động upload Cloudinary ngay */
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Vui lòng chọn file ảnh (jpg, png, webp...)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Ảnh không được vượt quá 5MB");
      return;
    }

    setAvatarFile(file);
    // Hiển thị preview ngay lập tức
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Tự động upload lên Cloudinary
    const result = await uploadAvatar(file);
    if (result.success && result.url) {
      setUploadedAvatarUrl(result.url);
    } else {
      showError(result.message, "Upload ảnh thất bại");
      // Reset nếu upload thất bại
      setAvatarFile(null);
      setAvatarPreview(null);
      setUploadedAvatarUrl(null);
    }
  };

  /** Lưu profile: Dùng URL đã upload sẵn → chỉ gọi API PUT */
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admin?.id) {
      showError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    const result = await updateProfile(
      admin.id,
      {
        email: userProfile.email,
        name: userProfile.name,
        phone: userProfile.phone,
        avatar_url: uploadedAvatarUrl || userProfile.avatar_url,
      }
    );

    if (result.success) {
      success(result.message);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setUploadedAvatarUrl(null);
      // Re-hydrate store để cập nhật thông tin mới nhất
      await hydrate();
    } else {
      showError(result.message, "Cập nhật thất bại");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setUploadedAvatarUrl(null);
    // Reset về dữ liệu gốc từ store
    if (admin) {
      const roleLabel = roles.length > 0 ? roles[0].role : "User";
      setUserProfile({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        avatar_url: admin.avatar_url || "",
        role: roleLabel,
      });
    }
  };

  const getUserInitials = () => {
    const parts = userProfile.name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return userProfile.name ? userProfile.name[0].toUpperCase() : "?";
  };

  /** URL hiển thị avatar: preview file mới > avatar_url từ API > null */
  const displayAvatarUrl = avatarPreview || userProfile.avatar_url || null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600">
              Manage your profile details and security preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.SECURITY}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Key size={16} />
            Change Password
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 h-full">
              <div className="flex flex-col items-center">
                {/* Avatar with Camera Icon */}
                <div className="relative group mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-md overflow-hidden">
                    {displayAvatarUrl ? (
                      <img
                        src={displayAvatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-4xl">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  {/* Camera button - chỉ hiện khi đang edit */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-amber-800 hover:bg-amber-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
                      aria-label="Upload photo"
                    >
                      {isUploading ? (
                        <Loader2 className="text-white animate-spin" size={18} />
                      ) : (
                        <Camera className="text-white" size={18} />
                      )}
                    </button>
                  )}
                  {/* Overlay khi đang upload */}
                  {isUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <Loader2 className="text-white animate-spin" size={24} />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {userProfile.name}
                </h3>
                <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                  {userProfile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden h-full">
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <User className="text-amber-800" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Personal Information
                    </h2>
                    <p className="text-sm text-gray-500">
                      Update your personal details here.
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    Edit Details
                  </button>
                )}
              </div>

              {/* Card Body - Form */}
              <form onSubmit={handleProfileSave} className="p-6">
                <div className="space-y-5">
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <LabeledInputWithIcon
                      label="Họ và Tên"
                      icon={<User size={18} />}
                      value={userProfile.name}
                      onChange={(val) =>
                        setUserProfile({ ...userProfile, name: val })
                      }
                      disabled={!isEditing}
                      placeholder="Nhập họ và tên"
                      required
                    />
                    <LabeledInputWithIcon
                      label="Số điện thoại"
                      icon={<Phone size={18} />}
                      value={userProfile.phone}
                      onChange={(val) =>
                        setUserProfile({ ...userProfile, phone: val })
                      }
                      disabled={!isEditing}
                      placeholder="0123456789"
                      required
                    />
                  </div>

                  {/* Email Address (disabled) */}
                  <LabeledInputWithIcon
                    label="Email"
                    icon={<Mail size={18} />}
                    value={userProfile.email}
                    type="email"
                    disabled={true}
                  />

                  {/* Trạng thái upload avatar */}
                  {avatarFile && (
                    <p className="text-sm text-amber-700">
                      {isUploading ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 size={13} className="animate-spin" />
                          Đang upload ảnh...
                        </span>
                      ) : uploadedAvatarUrl ? (
                        <span className="text-green-600">✓ Upload thành công: <strong>{avatarFile.name}</strong></span>
                      ) : null}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      disabled={isUpdatingProfile}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingProfile || isUploading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingProfile && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
