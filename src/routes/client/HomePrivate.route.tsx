import React from "react";
import { Route } from "react-router-dom";
import ClientGuard from "../guard/ClientGuard.route";
import { ROUTER_URL } from "../router.const";
import ClientLayout from "@/layouts/ClientLayout/ClientLayout";
import { ProfilePage } from "@/modules/client/auth-client";

// Lazy load private pages
const OrderHistoryPage = React.lazy(() => import("@/modules/client/order-history"));
const CartPage = React.lazy(() => import("@/modules/client/cart/pages/Cart"));
const FranchisePage = React.lazy(() => import("@/modules/client/franchise"));
// const PaymentPage = React.lazy(() => import("@/modules/client/payment/pages/Payment"))

/**
 * HomePrivateRoutes - Các route PRIVATE (cần đăng nhập)
 * Được bảo vệ bởi ClientGuard
 * Layout: ClientLayout (header động: guest → ClientHeader, logged in → HomeHeader)
 * Routes: /cart, /franchise, /order-history, /profile, /change-password, /checkout, /select-franchise
 */
export const HomePrivateRoutes = (
  <Route element={<ClientGuard />}>
    <Route element={<ClientLayout />}>
      <Route path={ROUTER_URL.HOME_ROUTER.CART} element={<CartPage />} />
      <Route path={ROUTER_URL.HOME_ROUTER.FRANCHISE} element={<FranchisePage />} />
      <Route path={ROUTER_URL.HOME_ROUTER.ORDER_HISTORY} element={<OrderHistoryPage />} />
      <Route path={ROUTER_URL.HOME_ROUTER.PROFILE} element={<ProfilePage />} />
      <Route path={ROUTER_URL.HOME_ROUTER.CHANGE_PASSWORD} element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Change Password Page</h1></div>} />
      {/* <Route path={ROUTER_URL.HOME_ROUTER.CHECKOUT} element={<PaymentPage />} /> */}
      <Route path={ROUTER_URL.HOME_ROUTER.SELECT_FRANCHISE} element={<div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Select Franchise Page</h1></div>} />
    </Route>
  </Route>
);
