import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/modules/client/auth-client";

/**
 * ClientRoot — wrapper cho toàn bộ client routes.
 * Chỉ chạy client AuthProvider (initializeAuth) khi người dùng truy cập client pages.
 * Không ảnh hưởng gì tới admin side.
 */
function ClientRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default ClientRoot;
