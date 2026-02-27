import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/client-forgot-password.schema";
import { Mail } from "lucide-react";
import AuthInput from "@/components/ui/auth-input";
import AuthButton from "@/components/ui/auth-button";

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

function ForgotPasswordForm({ onSubmit, isLoading = false, error = '' }: ForgotPasswordFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

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
        placeholder="Nhập địa chỉ Gmail của bạn"
        disabled={isLoading}
        error={errors.email?.message}
      />

      <AuthButton type="submit" isLoading={isLoading} loadingText="Đang gửi..." className="mt-2">
        Gửi mật khẩu mới
      </AuthButton>
    </form>
  );
}

export default ForgotPasswordForm;