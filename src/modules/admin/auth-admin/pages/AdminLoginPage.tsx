import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { mockUsers } from "@/mockdata";
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
                Coffee is a language in itself.
              </p>
              <p className="mt-3 text-xs opacity-90">
                — Jackie Chan
              </p>
            </div>
          </div>
        </div>

        {/* ✅ RIGHT FORM - UPDATED WITH NEW COLOR SCHEME */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--cf-surface)' }}>
          <div className="w-full max-w-2xl p-12 rounded-2xl" style={{ backgroundColor: 'var(--cf-bg)' }}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="text-4xl p-3 rounded-lg" style={{ backgroundColor: 'var(--cf-primary)', color: 'white' }}>
                  <img src="https://cdn.discordapp.com/attachments/1460639504233660461/1468430883915829421/BeautyPlus-IMAGE-ENHANCER-1770171590197.png?ex=6983fe54&is=6982acd4&hm=1ddcc827aab77ba595859871a202719c2ebfbb26c9061ffdde807c3077cd2ebe" alt="BrewBase Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--cf-primary)' }}>
                  BrewBase
                </div>
              </div>

              <h1 className="text-5xl font-bold mt-8" style={{ color: 'var(--cf-primary)' }}>
                Welcome back
              </h1>
              <p className="text-lg mt-3" style={{ color: 'var(--cf-secondary)' }}>
                Log in to the Coffee Chain Admin Portal
              </p>
            </div>

            <AdminLoginForm
              onSubmit={handleLogin}
              authError={authError}
              isSubmitting={loading}
              onClearError={() => setAuthError(null)}
            />

            <p className="text-center text-base mt-8" style={{ color: 'var(--cf-secondary)' }}>
              Need help?{" "}
              <a className="hover:underline font-semibold" style={{ color: 'var(--cf-primary)' }}>
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
