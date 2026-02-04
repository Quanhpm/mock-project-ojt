import React from "react";
import { Route } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import ClientLayout from "@/layouts/ClientLayout/ClientLayout";

// Lazy load pages
const HomePage = React.lazy(() => import("@/modules/client/home/pages/HomePage"));
const AboutPage = React.lazy(() => import("@/modules/client/about"));
const ContactPage = React.lazy(() => import("@/modules/client/contact"));

/**
 * ClientPublicRoutes - Các route PUBLIC cho GUEST
 * Layout: ClientLayout (header với Login/Register)
 * Routes: /, /menu, /about, /contact
 */
export const ClientPublicRoutes = (
  <Route element={<ClientLayout />}>
    <Route path={ROUTER_URL.HOME} element={<HomePage />} />
    <Route path={ROUTER_URL.MENU} element={<div>Menu Page - Coming Soon</div>} />
    <Route path={ROUTER_URL.ABOUT} element={<AboutPage />} />
    <Route path={ROUTER_URL.CONTACT} element={<ContactPage />} />
  </Route>
);
