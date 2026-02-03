import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import { useClientAuthStore } from "../stores/client-auth.store";
import { showToast } from "@/components/ui/toast";
import { ROUTER_URL } from "@/routes/router.const";

function RegisterPage() {
    const navigate = useNavigate();
    const login = useClientAuthStore((state) => state.login);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (data: {
        name: string;
        phone: string;
        email: string;
        password: string;
    }) => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const newUser = {
                id: Math.random(),
                email: data.email,
                name: data.name,
                phone: data.phone,
                avatar_url: "https://i.pravatar.cc/150?img=32",
                is_active: true,
                is_deleted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            login(newUser);
            showToast("Đăng ký thành công!", "success", {
                description: `Chào mừng ${data.name} đến với gì gì đó`
            });
            navigate(ROUTER_URL.HOME);
        } catch (error) {
            const errMsg = "Đăng ký thất bại";
            setErrorMessage(errMsg);
            showToast(errMsg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600 text-sm">Join us and start your journey today.</p>
            </div>

            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={errorMessage} />

            <div className="pt-8 border-t border-gray-200 w-full max-w-md mx-auto">
                <p className="text-sm text-gray-600 text-center mb-8">
                    Already have an account? <a href="/client/login" className="text-orange-500 hover:text-orange-600 font-semibold">Sign In</a>
                </p>

            </div>
        </>
    );
}

export default RegisterPage;