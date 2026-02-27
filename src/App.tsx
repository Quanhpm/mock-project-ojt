import Loading from "@/layouts/LoadingLayout/LoadingLayout";
import { useClientAuthStore } from "@/modules/client/auth-client/stores/client-auth.store";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { setupApi } from "@/apis";
import { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFoundPage from "@/modules/NotFoundPage.page";
import { 
  AdminAuthRoutes, 
  AdminRoutes, 
  ClientAuthRoutes, 
  ClientPublicRoutes, 
  HomePrivateRoutes 
} from "./routes";
import { ToasterComponent } from "@/components/ui/toast";

// Đăng ký interceptors 1 lần khi module load
setupApi();

const App = () => {
  const clientHydrate = useClientAuthStore((state) => state.hydrate);
  const adminHydrate = useAdminAuthStore((state) => state.hydrate);
  const adminIsLoading = useAdminAuthStore((state) => state.isLoading);

  // Khi reload: client hydrate từ localStorage, admin hydrate từ API (cookie)
  useEffect(() => {
    clientHydrate();
    adminHydrate();
  }, [clientHydrate, adminHydrate]);

  return (
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
  );
};
//test

export default App;
