import React from "react";
import { Route } from "react-router-dom";
import { ROUTER_URL } from "../router.const";

const AdminLoginPage = React.lazy(() => import("@/modules/admin/auth-admin/pages/AdminLoginPage"));
const ForgotPasswordPage = React.lazy(() => import("@/modules/admin/auth-admin/pages/ForgotPasswordPage"));

export const AdminAuthRoutes = (
  <>
    <Route path={ROUTER_URL.ADMIN_ROUTER.LOGIN} element={<AdminLoginPage />} />
    <Route path={ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
  </>
);
