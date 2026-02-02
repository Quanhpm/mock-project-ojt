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
<<<<<<< Updated upstream
    const onSubmit = async (data: LoginFormValues) => {
        const user = mockUsers.find(u => u.email === data.email);
        
        if (!user) {

        } 
        else {
            // if (user.password !==) {
                
            // }
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Email</label>
                <input {...register("email")} />
                {errors.email && <p>{errors.email.message}</p>}
            </div>
            <div>
                <label>Password</label>
                <input {...register("password")}
=======

    return (
        <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-sm bg-[var(--cf-bg)] space-y-5 border border-[var(--cf-secondary)]/20"
        >
            <h2 className="text-2xl font-bold text-[var(--cf-primary)] text-center mb-2">Login</h2>

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
>>>>>>> Stashed changes
                />
                {errors.password && <p>{errors.password.message}</p>}
            </div>
<<<<<<< Updated upstream
            <button type="submit">Login</button>
=======

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 mt-2 font-bold text-white bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] active:scale-[0.98] rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Đang đăng nhập..." : "Login"}
            </button>
>>>>>>> Stashed changes
        </form>
    )
}

export default LoginForm