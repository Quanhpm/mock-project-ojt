import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { login, getProfile } from "@/apis/endpoints/auth.api";
import { HttpError } from "@/apis/http.types";
import { resetAuthRedirecting } from "@/apis/axios.config";
import { useAdminAuthStore } from "../stores/admin-auth.store";
import { useLoadingStore } from "@/stores/loading.store";
import { useToast } from "@/hooks/use-toast.hook";
import { ROUTER_URL } from "@/routes/router.const";
import type { AdminLoginFormValues } from "../schemas/admin-login.schema";

export function useAdminLogin() {
  const navigate = useNavigate();
  const setProfile = useAdminAuthStore((s) => s.setProfile);
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = useCallback(
    async (data: AdminLoginFormValues) => {
      setLoading(true);
      setErrorMessage("");
      incrementGlobalLoading();

      try {
        // Reset cờ redirect trước khi login (user đang ở trang login = hợp lệ)
        resetAuthRedirecting();

        // 1. POST /auth → backend set HttpOnly Cookie
        await login({ email: data.email, password: data.password });

        // 2. GET /auth → lấy profile
        const profile = await getProfile();

        if (!profile) {
          throw new Error("Không lấy được thông tin người dùng");
        }

        // 3. Lưu vào zustand store
        setProfile(profile);

        // 4. Nếu server đã có active_context (session cũ) → vào dashboard thẳng
        //    Nếu chưa có context → bắt buộc chọn franchise
        success("Đăng nhập thành công!");
        if (profile.active_context) {
          navigate(
            `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`,
            { replace: true },
          );
        } else {
          navigate(
            `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.SELECT_FRANCHISE}`,
            { replace: true },
          );
        }
      } catch (err) {
        const message =
          err instanceof HttpError
            ? err.message
            : "Email hoặc mật khẩu không chính xác";

        setErrorMessage(message);
        showError(message, "Đăng nhập thất bại");
      } finally {
        setLoading(false);
        decrementGlobalLoading();
      }
    },
    [navigate, setProfile, incrementGlobalLoading, decrementGlobalLoading, success, showError],
  );

  return { handleLogin, loading, errorMessage };
}
