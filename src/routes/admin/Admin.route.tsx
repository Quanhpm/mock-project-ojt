import AdminLayout from "@/layouts/AdminLayout/AdminLayout.tsx";
import { Navigate, Route } from "react-router-dom";
import React from "react";
import AdminGuard from "../guard/AdminGuard.route.tsx";
import SelectFranchiseGuard from "../guard/SelectFranchiseGuard.route.tsx";
import ProtectedRoute from "../ProtectedRoute";
import { ROUTER_URL } from "../router.const";
import { ADMIN_MENU } from "./Admin.menu.tsx";

// Lazy load Account Settings Page
const AccountSettingsPage = React.lazy(
  () => import("@/modules/admin/account-settings/user.tsx"),
);
const SecurityPage = React.lazy(
  () => import("@/modules/admin/account-settings/pages/SecurityPage.tsx"),
);

export const AdminRoutes = (
  <Route element={<AdminGuard />}>
    {/* Main Admin Layout with Sidebar */}
    <Route path={ROUTER_URL.ADMIN} element={<AdminLayout />}>
      <Route
        index
        element={<Navigate to={ROUTER_URL.ADMIN_ROUTER.DASHBOARD} replace />}
      />

      {/* SelectFranchiseGuard wraps all routes that require franchise context */}
      <Route element={<SelectFranchiseGuard />}>
        {ADMIN_MENU.filter(item => item.module !== 'select-franchise').map((item) => (
          <Route 
            key={item.path} 
            path={item.path} 
            element={
              <ProtectedRoute 
                requiredModule={item.module}
                allowedRoles={item.allowedRoles}
                element={<item.component />}
              />
            } 
          />
        ))}

        {/* Account Settings Route */}
        <Route
          path={ROUTER_URL.ADMIN_ROUTER.ACCOUNT}
          element={<AccountSettingsPage />}
        />
        <Route
          path={ROUTER_URL.ADMIN_ROUTER.SECURITY}
          element={<SecurityPage />}
        />
      </Route>
    </Route>

    {/* Franchise Selection - Standalone (no layout, no sidebar) */}
    {ADMIN_MENU.filter(item => item.module === 'select-franchise').map((item) => (
      <Route 
        key={item.path} 
        path={`${ROUTER_URL.ADMIN}/${item.path}`}
        element={
          <ProtectedRoute 
            requiredModule={item.module}
            allowedRoles={item.allowedRoles}
            element={<item.component />}
          />
        } 
      />
    ))}
  </Route>
);
