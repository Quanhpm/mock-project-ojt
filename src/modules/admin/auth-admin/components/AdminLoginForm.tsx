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
      className="space-y-5"
    >
      {/* Email */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="text"
          {...register("email")}
          className={`mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2
            ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-orange-500"
            }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          className={`mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2
            ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-orange-500"
            }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
