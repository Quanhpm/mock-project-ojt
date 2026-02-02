import AdminLayout from "@/layouts/AdminLayout/AdminLayout.tsx";
import { Navigate, Route } from "react-router-dom";
import AdminGuard from "../guard/AdminGuard.route.tsx";
import { ROUTER_URL } from "../router.const";
import { ADMIN_MENU } from "./Admin.menu.tsx";

export const AdminRoutes = (
  <Route element={<AdminGuard />}>
    <Route path={ROUTER_URL.ADMIN} element={<AdminLayout />}>
      <Route index element={<Navigate to={ROUTER_URL.ADMIN_ROUTER.DASHBOARD} replace />} />

      {ADMIN_MENU.map((item) => (
        <Route key={item.path} path={item.path} element={<item.component />} />
      ))}
    </Route>
  </Route>
);
