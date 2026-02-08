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
          {/* Layout: ClientLayout (header động: guest → ClientHeader, logged in → HomeHeader) */}
          {ClientPublicRoutes}

          {/* ========== HOME PRIVATE ROUTES ========== */}
          {/* Cần đăng nhập: /cart, /order-history, /profile, /change-password, /checkout */}
          {/* Layout: ClientLayout (header động: HomeHeader + ClientFooter) */}
          {/* Guard: ClientGuard (redirect to /client/login if not authenticated) */}
          {HomePrivateRoutes}

          {/* ========== 404 NOT FOUND ========== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>



      {/* Toast notifications */}
      <ToasterComponent />
    </BrowserRouter>
  );
};
//test

export default App;
