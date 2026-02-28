import Loading from "@/layouts/LoadingLayout/LoadingLayout";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { AuthProvider } from "@/modules/client/auth-client";
import { setupApi } from "@/apis";
import { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFoundPage from "@/modules/NotFoundPage.page";
import { 
  AdminAuthRoutes, 
  AdminRoutes, 
  ClientAuthRoutes, 
  ClientPublicRoutes, 
  HomePrivateRoutes,
  VerifyEmailRoute 
} from "./routes";
import { ToasterComponent } from "@/components/ui/toast";

// Đăng ký interceptors 1 lần khi module load
setupApi();

const App = () => {
  const adminHydrate = useAdminAuthStore((state) => state.hydrate);
  const adminIsLoading = useAdminAuthStore((state) => state.isLoading);

  // Admin hydrate từ API (cookie)
  useEffect(() => {
    adminHydrate();
  }, [adminHydrate]);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Chờ admin hydrate xong (gọi GET /auth) trước khi render routes */}
        {adminIsLoading ? (
          <Loading />
        ) : (
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* ========== ADMIN ROUTES ========== */}
              {AdminAuthRoutes}
              {AdminRoutes}

              {/* ========== CLIENT AUTH ROUTES ========== */}
              {ClientAuthRoutes}

              {/* ========== CLIENT PUBLIC ROUTES ========== */}
              {ClientPublicRoutes}

              {/* ========== VERIFY EMAIL (standalone, no layout) ========== */}
              {VerifyEmailRoute}

              {/* ========== HOME PRIVATE ROUTES ========== */}
              {HomePrivateRoutes}

              {/* ========== 404 NOT FOUND ========== */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        )}

        {/* Toast notifications */}
        <ToasterComponent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
