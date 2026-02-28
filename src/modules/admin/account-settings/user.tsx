import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Camera,
  Shield,
  Key,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { useChangePassword } from "./hooks/use-change-password.hook";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "./schemas/change-password.schema";

// ==================== INTERFACES ====================
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
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
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
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
  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@brewadmin.com",
    role: "Super Admin",
  });

  // Security form with react-hook-form and Zod
  const {
    register,
    handleSubmit: handleSecuritySubmit,
    formState: { errors: securityErrors },
    reset: resetSecurityForm,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Hooks
  const { success, error: showError } = useToast();
  const { changePassword, isLoading: isChangingPassword } = useChangePassword();

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Profile saved:", userProfile);
      setIsLoading(false);
      setIsEditing(false);
      // Add toast notification here
    }, 1000);
  };

  const handlePasswordUpdate = async (data: ChangePasswordFormValues) => {
    // Gọi API changePassword với payload đúng cấu trúc
    const result = await changePassword({
      old_password: data.currentPassword,
      new_password: data.newPassword,
    });

    if (result.success) {
      success(result.message);
      resetSecurityForm(); // Reset form về trạng thái ban đầu
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      showError(result.message, "Đổi mật khẩu thất bại");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  const getUserInitials = () => {
    return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile details and security preferences.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
              <div className="flex flex-col items-center">
                {/* Avatar with Camera Icon */}
                <div className="relative group mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-4xl">
                      {getUserInitials()}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-amber-800 hover:bg-amber-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110"
                    aria-label="Upload photo"
                  >
                    <Camera className="text-white" size={18} />
                  </button>
                </div>

                {/* User Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {userProfile.firstName} {userProfile.lastName}
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
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
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
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <LabeledInputWithIcon
                      label="First Name"
                      icon={<User size={18} />}
                      value={userProfile.firstName}
                      onChange={(val) =>
                        setUserProfile({ ...userProfile, firstName: val })
                      }
                      disabled={!isEditing}
                      required
                    />
                    <LabeledInputWithIcon
                      label="Last Name"
                      icon={<User size={18} />}
                      value={userProfile.lastName}
                      onChange={(val) =>
                        setUserProfile({ ...userProfile, lastName: val })
                      }
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <LabeledInputWithIcon
                    label="Email Address"
                    icon={<Mail size={18} />}
                    value={userProfile.email}
                    onChange={(val) =>
                      setUserProfile({ ...userProfile, email: val })
                    }
                    type="email"
                    disabled={true}
                  />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-red-700" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Security
                    </h2>
                    <p className="text-sm text-gray-500">
                      Manage your password and security settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body - Form */}
              <form
                onSubmit={handleSecuritySubmit(handlePasswordUpdate)}
                className="p-6"
              >
                <div className="space-y-5">
                  {/* Current Password */}
                  <LabeledInputWithIcon
                    label="Current Password"
                    icon={<Key size={18} />}
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    required
                    error={securityErrors.currentPassword?.message}
                    inputRef={register("currentPassword").ref}
                    name="currentPassword"
                    rightIcon={
                      showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )
                    }
                    onRightIconClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                  />

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <LabeledInputWithIcon
                      label="New Password"
                      icon={<Key size={18} />}
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      required
                      minLength={8}
                      helperText="Phải có chữ hoa, thường, số, ký tự đặc biệt."
                      error={securityErrors.newPassword?.message}
                      inputRef={register("newPassword").ref}
                      name="newPassword"
                      rightIcon={
                        showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )
                      }
                      onRightIconClick={() =>
                        setShowNewPassword(!showNewPassword)
                      }
                    />
                    <LabeledInputWithIcon
                      label="Confirm Password"
                      icon={<Key size={18} />}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      required
                      error={securityErrors.confirmPassword?.message}
                      inputRef={register("confirmPassword").ref}
                      name="confirmPassword"
                      rightIcon={
                        showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )
                      }
                      onRightIconClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  </div>
                </div>

                {/* Update Button */}
                <div className="flex justify-end mt-6 pt-6 border-t border-stone-200">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
