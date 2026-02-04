import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "../schemas/admin-login.schema";

type Props = {
  onSubmit: (
    data: AdminLoginFormValues,
    helpers: {
      setError: (
        name: keyof AdminLoginFormValues,
        error: { type: string; message?: string }
      ) => void;
    }
  ) => void;
  isSubmitting?: boolean;
};

export function AdminLoginForm({ onSubmit, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onSubmit",
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((data) =>
        onSubmit(data, { setError })
      )}
      onChange={() => clearErrors()}
      className="space-y-6"
    >
      {/* Email */}
      <div>
        <label 
          className="text-base font-medium text-gray-800"
          style={{ color: 'var(--cf-primary)' }}
        >
          Email
        </label>
        <input
          type="text"
          {...register("email")}
          className={`mt-2 w-full rounded-lg border-2 px-4 py-3 text-base focus:outline-none focus:ring-2
            ${
              errors.email
                ? "border-red-500 focus:ring-red-500 focus:ring-opacity-50"
                : "focus:ring-offset-2 border-gray-300"
            }`}
          style={!errors.email ? { '--tw-ring-color': 'var(--cf-primary)', borderColor: 'var(--cf-secondary)' } as any : undefined}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label 
          className="text-base font-medium text-gray-800"
          style={{ color: 'var(--cf-primary)' }}
        >
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          className={`mt-2 w-full rounded-lg border-2 px-4 py-3 text-base focus:outline-none focus:ring-2
            ${
              errors.password
                ? "border-red-500 focus:ring-red-500 focus:ring-opacity-50"
                : "focus:ring-offset-2 border-gray-300"
            }`}
          style={!errors.password ? { '--tw-ring-color': 'var(--cf-primary)', borderColor: 'var(--cf-secondary)' } as any : undefined}
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full text-white py-3 rounded-lg font-semibold text-lg transition-all disabled:opacity-60"
        style={{
          backgroundColor: 'var(--cf-primary)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--cf-dark)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--cf-primary)'
        }
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
