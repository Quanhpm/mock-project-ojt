import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "../schemas/client-register.schema";
import { useState } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthInput from "@/components/ui/auth-input";
import AuthButton from "@/components/ui/auth-button";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

function RegisterForm({ onSubmit, isLoading = false, error = '' }: RegisterFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <AuthInput
        {...register("name")}
        icon={<User size={17} />}
        placeholder="Tên người dùng"
        disabled={isLoading}
        error={errors.name?.message}
      />

      <AuthInput
        {...register("phone")}
        icon={<Phone size={17} />}
        placeholder="Số điện thoại"
        disabled={isLoading}
        error={errors.phone?.message}
      />

      <AuthInput
        {...register("email")}
        icon={<Mail size={17} />}
        type="email"
        placeholder="Địa chỉ email"
        disabled={isLoading}
        error={errors.email?.message}
      />

      <AuthInput
        {...register("password")}
        icon={<Lock size={17} />}
        type={showPassword ? "text" : "password"}
        placeholder="Mật khẩu"
        disabled={isLoading}
        error={errors.password?.message}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="cursor-pointer hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <AuthInput
        {...register("confirmPassword")}
        icon={<Lock size={17} />}
        type={showConfirm ? "text" : "password"}
        placeholder="Xác nhận mật khẩu"
        disabled={isLoading}
        error={errors.confirmPassword?.message}
        suffix={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="cursor-pointer hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <AuthButton
        type="submit"
        isLoading={isLoading}
        loadingText="Đang tạo tài khoản..."
        className="mt-2"
      >
        Tạo tài khoản
      </AuthButton>
    </form>
  );
}

export default RegisterForm;