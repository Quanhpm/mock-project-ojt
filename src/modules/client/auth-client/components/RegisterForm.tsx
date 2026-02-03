import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormValues } from "../schemas/client-register.schema"

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

function RegisterForm({ onSubmit, isLoading = false, error = '' }: RegisterFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
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
                    <label className="text-sm font-semibold text-[var(--cf-primary)] ml-1">Name</label>
                    <input 
                        {...register("name")} 
                        className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
                        placeholder="Input Your Name"
                        disabled={isLoading}
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1 ml-1">{errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--cf-primary)] ml-1">Phone</label>
                    <input 
                        {...register("phone")} 
                        className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
                        placeholder="0901 xxx xxx"
                        disabled={isLoading}
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1 ml-1">{errors.phone.message}</p>}
                </div>

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
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 mt-2 font-bold text-white bg-[var(--cf-secondary)] hover:bg-[var(--cf-dark)] active:scale-[0.98] rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Đang đăng ký..." : "Register"}
                </button>
            </form>
    );
}

export default RegisterForm