import { GlobalLoadingOverlay } from "@/components/GlobalLoadingOverlay";
import { setupApi } from "@/apis";
import { Suspense } from "react";
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
import AdminRoot from "@/layouts/AdminLayout/AdminRoot";
import ClientRoot from "@/layouts/ClientLayout/ClientRoot";

// Đăng ký interceptors 1 lần khi module load
setupApi();

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<GlobalLoadingOverlay forceShow />}>
        <Routes>
          {/* ========== ADMIN ROUTES — hydrate admin chỉ khi vào /admin/* ========== */}
          <Route element={<AdminRoot />}>
            {AdminAuthRoutes}
            {AdminRoutes}
          </Route>

          {/* ========== CLIENT ROUTES — hydrate client chỉ khi vào client pages ========== */}
          <Route element={<ClientRoot />}>
            {ClientAuthRoutes}
            {ClientPublicRoutes}
            {VerifyEmailRoute}
            {HomePrivateRoutes}
          </Route>

          {/* ========== 404 NOT FOUND ========== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Toast notifications */}
      <ToasterComponent />
    </BrowserRouter>
  );
};

export default App;
