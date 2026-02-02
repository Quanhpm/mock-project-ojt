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
                />
                {errors.password && <p>{errors.password.message}</p>}
            </div>
            <button type="submit">Login</button>
        </form>
    )
}

export default LoginForm