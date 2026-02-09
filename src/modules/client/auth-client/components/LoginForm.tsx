import { useForm } from "react-hook-form"
import { loginSchema, type LoginFormValues } from "../schemas/client-login.schema";
import { zodResolver } from "@hookform/resolvers/zod";

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

function LoginForm({ onSubmit, isLoading = false, error = '' }: LoginFormProps) {

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    return (
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
                        className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
                        placeholder="example@gmail.com"
                        disabled={isLoading}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--cf-primary)] ml-1">Password</label>
                    <input 
                        {...register("password")} 
                        type="password"
                        className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                    {errors.password && <p className="text-xs text-red-600 mt-1 ml-1">{errors.password.message}</p>}
                    <a href="/client/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 font-semibold ml-auto">
                        Forgot Password?
                    </a>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 mt-2 font-bold text-white bg-[var(--cf-secondary)] hover:bg-[var(--cf-dark)] active:scale-[0.98] rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Đang đăng nhập..." : "Login"}
                </button>
            </form>
    )
}

export default LoginForm
