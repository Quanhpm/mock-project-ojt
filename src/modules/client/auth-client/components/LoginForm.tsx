import { useForm } from "react-hook-form"
import { loginSchema, type LoginFormValues } from "../schemas/client-login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { mockUsers } from '@/mock/data/users.mock';

function LoginForm() {

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        const user = mockUsers.find(u => u.email === data.email);
        
        if (!user) {
            // Xử lý khi không tìm thấy user
        } 
        else {
            // Xử lý logic password ở đây
        }
    }

    return (
        <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-sm bg-[var(--cf-bg)] space-y-5 border border-[var(--cf-secondary)]/20"
        >
            <h2 className="text-2xl font-bold text-[var(--cf-primary)] text-center mb-2">Login</h2>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[var(--cf-primary)] ml-1">Email</label>
                <input 
                    {...register("email")} 
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--cf-secondary)] bg-white focus:ring-2 focus:ring-[var(--cf-accent-light)] focus:outline-none transition-all placeholder:text-[var(--cf-secondary)]/50"
                    placeholder="example@gmail.com"
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
                />
                {errors.password && <p className="text-xs text-red-600 mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <button 
                type="submit" 
                className="w-full py-3 mt-2 font-bold text-white bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] active:scale-[0.98] rounded-lg shadow-md transition-all cursor-pointer"
            >
                Login
            </button>
        </form>
    )
}

export default LoginForm