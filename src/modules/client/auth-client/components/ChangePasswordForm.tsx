import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordFormValues } from "../schemas/client-change-password.schema";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import AuthInput from "@/components/ui/auth-input";
import AuthButton from "@/components/ui/auth-button";

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

function ChangePasswordForm({ onSubmit, isLoading = false, error = '' }: ChangePasswordFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <AuthInput
        {...register("currentPassword")}
        icon={<Lock size={17} />}
        type={showCurrent ? "text" : "password"}
        placeholder="Mật khẩu hiện tại"
        disabled={isLoading}
        error={errors.currentPassword?.message}
        suffix={
          <button type="button" tabIndex={-1}
            onClick={() => setShowCurrent(v => !v)}
            className="cursor-pointer hover:text-white transition-colors">
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <p className="text-white/60 text-sm px-1">Nhập mật khẩu mới của bạn để hoàn tất.</p>

      <AuthInput
        {...register("newPassword")}
        icon={<Lock size={17} />}
        type={showNew ? "text" : "password"}
        placeholder="Mật khẩu mới"
        disabled={isLoading}
        error={errors.newPassword?.message}
        suffix={
          <button type="button" tabIndex={-1}
            onClick={() => setShowNew(v => !v)}
            className="cursor-pointer hover:text-white transition-colors">
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <AuthInput
        {...register("confirmPassword")}
        icon={<Lock size={17} />}
        type={showConfirm ? "text" : "password"}
        placeholder="Xác nhập mật khẩu"
        disabled={isLoading}
        error={errors.confirmPassword?.message}
        suffix={
          <button type="button" tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
            className="cursor-pointer hover:text-white transition-colors">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <AuthButton type="submit" isLoading={isLoading} loadingText="Đang lưu..." className="mt-2">
        Đổi mật khẩu
      </AuthButton>
    </form>
  );
}

export default ChangePasswordForm;