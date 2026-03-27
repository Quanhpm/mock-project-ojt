import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import AuthCard from "@/components/ui/auth-card";
import { showToast } from "@/components/ui/toast";
import { ROUTER_URL } from "@/routes/router.const";
import { useClientRegister } from "../hooks/use-client-register.hook";

function RegisterPage() {
    const navigate = useNavigate();
    const { register, isLoading, error: errorMessage } = useClientRegister();

    const handleRegister = async (data: {
        name: string;
        phone: string;
        email: string;
        password: string;
    }) => {
        const result = await register(data);

        if (result.success) {
            showToast("Đăng ký thành công!", "success", {
                description: result.user?.name
                    ? `Chào mừng ${result.user.name} đến với hệ thống. Vui lòng kiểm tra email để xác thực tài khoản.`
                    : "Vui lòng kiểm tra email để xác thực tài khoản."
            });
            // Redirect to login page after successful registration
            navigate(ROUTER_URL.CLIENT_ROUTER?.LOGIN || "/client/login");
        } else {
            showToast(result.message, "error");
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
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={errorMessage || ''} />
        </AuthCard>
    );
}

export default RegisterPage;