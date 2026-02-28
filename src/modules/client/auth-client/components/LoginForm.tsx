import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormValues } from "../schemas/client-login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthInput from "@/components/ui/auth-input";
import AuthButton from "@/components/ui/auth-button";

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

function LoginForm({ onSubmit, isLoading = false, error = '' }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <AuthInput
        {...register("email")}
        icon={<Mail size={17} />}
        type="email"
        placeholder="Địa chỉ email"
        disabled={isLoading}
        error={errors.email?.message}
      />

      <div className="flex flex-col gap-1">
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
        <a
          href="/client/forgot-password"
          className="text-xs text-white/55 hover:text-white font-medium ml-auto mt-1 transition-colors"
        >
          Quên mật khẩu?
        </a>
      </div>

      <AuthButton type="submit" isLoading={isLoading} loadingText="Đang đăng nhập..." className="mt-2">
        Đăng nhập
      </AuthButton>
    </form>
  );
}

export default LoginForm;