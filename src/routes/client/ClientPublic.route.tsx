import React from "react";
import { Route } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import ClientLayout from "@/layouts/ClientLayout/ClientLayout";
import { ContactLayout } from "@/modules/client/contact/layouts";

// Lazy load pages
const HomePage = React.lazy(() => import("@/modules/client/home/pages/HomePage"));
const AboutPage = React.lazy(() => import("@/modules/client/about"));
const ContactPage = React.lazy(() => import("@/modules/client/contact"));
const MenuPage = React.lazy(() => import("@/modules/client/menu"));

/**
 * ClientPublicRoutes - Các route PUBLIC cho GUEST
 * Layout: ClientLayout (header với Login/Register)
 * Routes: /, /menu, /about, /contact
 */
export const ClientPublicRoutes = (
  <>
    <Route element={<ClientLayout />}>
      <Route path={ROUTER_URL.HOME} element={<HomePage />} />
      <Route path={ROUTER_URL.MENU} element={<MenuPage />} />
      <Route path={ROUTER_URL.ABOUT} element={<AboutPage />} />
    </Route>
    <Route element={<ContactLayout />}>
      <Route path={ROUTER_URL.CONTACT} element={<ContactPage />} />
    </Route>
  </>
);
