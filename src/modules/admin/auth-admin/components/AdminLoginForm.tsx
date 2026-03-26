import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "../schemas/admin-login.schema";

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

interface AdminLoginFormProps {
  onSubmit: (data: AdminLoginFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function AdminLoginForm({ onSubmit, isLoading = false, error = "" }: AdminLoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
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
        <label className="text-sm font-semibold text-[var(--cf-primary)] ml-1">Email</label>
        <input
          {...register("email")}
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white text-black focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
          placeholder="admin@example.com"
        />
        {errors.email && <p className="text-xs text-red-600 mt-1 ml-1">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-[var(--cf-primary)] ml-1">Password</label>
          <a href="/admin/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 font-semibold">
            Forgot Password?
          </a>
        </div>
        <input
          {...register("password")}
          type="password"
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white text-black focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-xs text-red-600 mt-1 ml-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 mt-2 font-bold text-white bg-[var(--cf-secondary)] hover:bg-[var(--cf-dark)] active:scale-[0.98] rounded-lg shadow-md transition-all cursor-pointer"
      >
        {isLoading ? "Signing in..." : "Login"}
      </button>
    </form>
    </>
  );
}
