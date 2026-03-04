import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Key, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { useChangePassword } from "../hooks/use-change-password.hook";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/change-password.schema";

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { changePassword, isLoading: isChangingPassword } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: ChangePasswordFormValues) => {
    const result = await changePassword({
      old_password: data.currentPassword,
      new_password: data.newPassword,
    });

    if (result.success) {
      success(result.message);
      reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      return;
    }

    showError(result.message, "Đổi mật khẩu thất bại");
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Security</h1>
            <p className="text-gray-600">Manage your password and security settings.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-300 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Key className="text-red-700" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Update your account password.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800">
                  <Key size={18} />
                </div>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border bg-white border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                  {...register("currentPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-700 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword?.message && (
                <p className="text-xs text-red-600 ml-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800">
                    <Key size={18} />
                  </div>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border bg-white border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-700 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword?.message && (
                  <p className="text-xs text-red-600 ml-1">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800">
                    <Key size={18} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border bg-white border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword?.message && (
                  <p className="text-xs text-red-600 ml-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-stone-200">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword && <Loader2 size={16} className="animate-spin" />}
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
