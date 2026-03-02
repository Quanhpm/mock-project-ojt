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

export const AdminRoutes = (
  <Route element={<AdminGuard />}>
    <Route path={ROUTER_URL.ADMIN} element={<AdminLayout />}>
      <Route
        index
        element={<Navigate to={ROUTER_URL.ADMIN_ROUTER.DASHBOARD} replace />}
      />

      {/* SelectFranchiseGuard wraps all routes EXCEPT select-franchise */}
      <Route element={<SelectFranchiseGuard />}>
        {ADMIN_MENU.filter(item => item.module !== 'select-franchise').map((item) => (
          <Route 
            key={item.path} 
            path={item.path} 
            element={
              <ProtectedRoute 
                requiredModule={item.module}
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
      </Route>

      {/* Select Franchise Route - OUTSIDE SelectFranchiseGuard */}
      {ADMIN_MENU.filter(item => item.module === 'select-franchise').map((item) => (
        <Route 
          key={item.path} 
          path={item.path} 
          element={
            <ProtectedRoute 
              requiredModule={item.module}
              element={<item.component />}
            />
          } 
        />
      ))}
    </Route>
  </Route>
);
