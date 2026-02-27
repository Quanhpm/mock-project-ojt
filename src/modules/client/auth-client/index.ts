// Context
export { AuthProvider } from "./context/AuthContext";
export { useAuth } from "./context/useAuth";

// Hooks
export { useClientLogin } from "./hooks/use-client-login.hook";
export { useClientRegister } from "./hooks/use-client-register.hook";
export { useClientAuth } from "./hooks/use-client-auth.hook";
export { useClientForgotPassword } from "./hooks/use-client-forgot-password.hook";
export { useClientChangePassword } from "./hooks/use-client-change-password.hook";
export { useClientVerifyEmail } from "./hooks/use-client-verify-email.hook";

// Components
export { ClientPrivateRoute } from "./components/ClientPrivateRoute";

// Store
export { useClientAuthStore } from "./stores/client-auth.store";
export type { ClientUser } from "./stores/client-auth.store";

// Pages
export { default as LoginPage } from "./pages/LoginPage";
export { default as RegisterPage } from "./pages/RegisterPage";
export { default as ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { default as ChangePasswordPage } from "./pages/ChangePasswordPage";
export { default as ProfilePage } from "./pages/ProfilePage";
export { default as VerifyEmailPage } from "./pages/VerifyEmailPage";
