import Loading from "@/layouts/LoadingLayout/LoadingLayout";
import { useClientAuthStore } from "@/modules/client/auth-client/stores/client-auth.store";
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

const App = () => {
  const hydrate = useClientAuthStore((state) => state.hydrate);

  // sync localStorage -> store when reload
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ========== ADMIN ROUTES ========== */}
          {AdminAuthRoutes}
          {AdminRoutes}

          {/* ========== CLIENT AUTH ROUTES ========== */}
          {/* Login, Register, Forgot Password */}
          {ClientAuthRoutes}

          {/* ========== CLIENT PUBLIC ROUTES ========== */}
          {/* Guest có thể truy cập: /, /menu, /about, /contact */}
          {ClientPublicRoutes}

          {/* ========== HOME PRIVATE ROUTES ========== */}
          {/* Cần đăng nhập: /home, /home/cart, /home/profile */}
          {HomePrivateRoutes}

          {/* ========== 404 NOT FOUND ========== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Global loading */}
      <Loading />

      {/* Toast notifications */}
      <ToasterComponent />
    </BrowserRouter>
  );
};

export default App;
