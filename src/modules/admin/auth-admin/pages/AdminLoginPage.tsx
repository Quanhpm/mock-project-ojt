import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { mockUsers } from "@/mock/data/users.mock";
import { ROUTER_URL } from "@/routes/router.const";
import { useAdminAuthStore } from "../stores/admin-auth.store";

import { AdminLoginForm } from "../components/AdminLoginForm";
import { AdminLoadingForm } from "../components/AdminLoadingForm";
import { AdminToastForm } from "../components/AdminToastForm";
import { type AdminLoginFormValues } from "../schemas/admin-login.schema";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAdmin = useAdminAuthStore((s) => s.setAdmin);

  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleLogin = (data: AdminLoginFormValues) => {
    setLoading(true);

    setTimeout(() => {
      const admin = mockUsers.find(
        (u) =>
          u.email === data.email &&
          u.password === data.password &&
          u.role === "admin"
      );

      if (!admin) {
        setLoading(false);
        setAuthError("Email hoặc mật khẩu không đúng");
        setToastMessage("Đăng nhập không thành công");
        setToastType("error");
        setShowToast(true);
        return;
      }

      setAdmin(admin);
      setAuthError(null);
      setToastMessage("Đăng nhập thành công");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        navigate(
          `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`,
          { replace: true }
        );
      }, 1000);
    }, 1500);
  };

  const leftBg =
    "https://media.istockphoto.com/id/1467739359/vi/anh/t%C3%A1ch-c%C3%A0-ph%C3%AA-v%E1%BB%9Bi-kh%C3%B3i-v%C3%A0-h%E1%BA%A1t-c%C3%A0-ph%C3%AA-tr%C3%AAn-n%E1%BB%81n-g%E1%BB%97-c%C5%A9.jpg?b=1&s=612x612&w=0&k=20&c=CgG6x3jujWGOcqQ1quc400UsWpnoAt3q-9a-NgyV804=";

  return (
    <>
      {/* 🔥 Overlay */}
      {loading && <AdminLoadingForm />}
      <AdminToastForm
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
        duration={toastType === "error" ? 3000 : 2000}
      />

      <div className="min-h-screen flex">
        {/* ✅ LEFT IMAGE - GIỮ NGUYÊN */}
        <div
          className="hidden md:block md:w-1/2 relative"
          style={{
            backgroundImage: `url(${leftBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex items-end p-10">
            <div className="text-white italic max-w-xs">
              <p className="text-sm">
                "Coffee is a language in itself."
              </p>
              <p className="mt-3 text-xs opacity-90">
                — Jackie Chan
              </p>
            </div>
          </div>
        </div>

        {/* ✅ RIGHT FORM - GIỮ NGUYÊN */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
          <div className="w-full max-w-md p-10">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 text-white p-2 rounded">
                  ☕
                </div>
                <div className="text-xl font-semibold">
                  BrewBase
                </div>
              </div>

              <h1 className="text-3xl font-bold mt-6 text-gray-900">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Log in to the Coffee Chain Admin Portal
              </p>
            </div>

            <AdminLoginForm
              onSubmit={handleLogin}
              authError={authError}
              isSubmitting={loading}
              onClearError={() => setAuthError(null)}
            />

            <p className="text-center text-sm text-gray-500 mt-6">
              Need help?{" "}
              <a className="text-orange-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
