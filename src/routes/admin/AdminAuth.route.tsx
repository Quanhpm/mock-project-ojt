import React from "react";
import { Route } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import AuthAdminLayout from "@/layouts/AuthAdminLayout/AuthAdminLayout";

const AdminLoginPage = React.lazy(() => import("@/modules/admin/auth-admin/pages/AdminLoginPage"));
const ForgotPasswordPage = React.lazy(() => import("@/modules/admin/auth-admin/pages/ForgotPasswordPage"));
const VerifyUserEmailPage = React.lazy(() => import("@/modules/admin/verify-email/VerifyUserEmailPage"));

export const AdminAuthRoutes = (
  <Route element={<AuthAdminLayout />}>
    <Route path={ROUTER_URL.ADMIN_ROUTER.LOGIN} element={<AdminLoginPage />} />
    <Route path={ROUTER_URL.ADMIN_ROUTER.VERIFY_EMAIL} element={<VerifyUserEmailPage />} />
    <Route path={ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
  </Route>
);
