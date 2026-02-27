import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import AuthCard from "@/components/ui/auth-card";
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

    const footer = (
        <>
            Đã có tài khoản?{' '}
            <a href="/client/login" className="text-[var(--cf-accent-light)] hover:text-white font-semibold transition-colors">
                Đăng nhập
            </a>
        </>
    );

    return (
        <AuthCard
            title="Tạo tài khoản mới"
            description=""
            footer={footer}
        >
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={errorMessage} />
        </AuthCard>
    );
}

export default RegisterPage;