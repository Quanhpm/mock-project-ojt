import DynamicClientLayout from "@/layouts/DynamicClientLayout";
import AboutPage from "@/modules/client/about";
import ContactPage from "@/modules/client/contact";
import HomePage from "@/modules/client/home";
import { Route } from "react-router-dom";
import { ROUTER_URL } from "../router.const";

export const ClientPublicRoutes = (
  <Route element={<DynamicClientLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path={ROUTER_URL.ABOUT} element={<AboutPage />} />
    <Route path={ROUTER_URL.CONTACT} element={<ContactPage />} />
  </Route>
);
