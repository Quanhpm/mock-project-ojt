import  Loading  from "@/layouts/LoadingLayout/LoadingLayout";
import { useAuthStore } from "@/stores/auth.store";
import { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFoundPage from "@/modules/NotFoundPage.page";
import { AdminAuthRoutes, AdminRoutes, ClientAuthRoutes, ClientPublicRoutes, ClientRoutes } from "./routes";

const App = () => {
  const hydrate = useAuthStore((state) => state.hydrate);

  // sync localStorage -> store when reload
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Admin */}
          {AdminAuthRoutes}
          {AdminRoutes}

          {/* Client */}
          {ClientAuthRoutes}
          {ClientPublicRoutes}
          {ClientRoutes}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Global loading */}
      <Loading />
    </BrowserRouter>
  );
};

export default App;
