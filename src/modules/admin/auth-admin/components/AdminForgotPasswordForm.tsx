import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminForgotPasswordSchema,
  type AdminForgotPasswordFormValues,
} from "../schemas/admin-forgot-password.schema";

// Fix autofill text color issue
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #000 !important;
  }
`;

interface AdminForgotPasswordFormProps {
  onSubmit: (data: AdminForgotPasswordFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function AdminForgotPasswordForm({
  onSubmit,
  isLoading = false,
  error = "",
}: AdminForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminForgotPasswordFormValues>({
    resolver: zodResolver(adminForgotPasswordSchema),
  });

  return (
    <>
      <style>{autofillStyles}</style>
      <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md mx-auto p-6 rounded-2xl bg-[var(--cf-surface)] space-y-5"
    >
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[var(--cf-primary)] ml-1">
          Email Address
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
          placeholder="admin@example.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1 ml-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 mt-2 font-bold text-white bg-[var(--cf-secondary)] hover:bg-[var(--cf-dark)] active:scale-[0.98] rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Đang gửi..." : "Gửi mật khẩu mới"}
      </button>
    </form>
    </>
  );
}
