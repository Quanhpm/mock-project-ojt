import React from "react";
import { Route } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import ClientLayout from "@/layouts/ClientLayout/ClientLayout";

// Lazy load pages
const HomePage = React.lazy(() => import("@/modules/client/home/pages/HomePage"));
const AboutPage = React.lazy(() => import("@/modules/client/about"));
const ContactPage = React.lazy(() => import("@/modules/client/contact"));
const MenuPage = React.lazy(() => import("@/modules/client/menu"));

/**
 * ClientPublicRoutes - Các route PUBLIC cho GUEST
 * Layout: ClientLayout (header động: guest → ClientHeader, logged in → HomeHeader)
 * Routes: /, /menu, /about, /contact
 * KHÔNG cần đăng nhập
 */
export const ClientPublicRoutes = (
  <Route element={<ClientLayout />}>
    <Route path={ROUTER_URL.HOME} element={<HomePage />} />
    <Route path={ROUTER_URL.MENU} element={<MenuPage />} />
    <Route path={ROUTER_URL.ABOUT} element={<AboutPage />} />
    <Route path={ROUTER_URL.CONTACT} element={<ContactPage />} />
  </Route>
);
