import React from "react";
import { Route } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import AuthClientLayout from "@/layouts/AuthClientLayout/AuthClientLayout";

const LoginPage = React.lazy(() => import("@/modules/client/auth-client/pages/LoginPage"));
const ForgotPasswordPage = React.lazy(() => import("@/modules/client/auth-client/pages/ForgotPasswordPage"));

export const ClientAuthRoutes = (
  <Route element={<AuthClientLayout />}>
    <Route path={ROUTER_URL.CLIENT_ROUTER.LOGIN} element={<LoginPage />} />
    <Route path={ROUTER_URL.CLIENT_ROUTER.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
  </Route>
);
