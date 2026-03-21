import type { JSX } from "react";
import { ROUTER_URL } from "../router.const";
import React from "react";

export type ClientMenuItem = {
  label: string;
  path: string;
  component: React.LazyExoticComponent<() => JSX.Element>;
  isEnd?: boolean;
};

export const CLIENT_MENU: ClientMenuItem[] = [
  {
    label: "Cart",
    path: ROUTER_URL.CLIENT_ROUTER.CART,
    component: React.lazy(() => import("@/modules/client/cart/pages/Cart")),
    isEnd: true,
  },
  {
    label: "Payment",
    path: ROUTER_URL.CLIENT_ROUTER.PAYMENT,
    component: React.lazy(() => import("@/modules/client/payment/pages/Payment")),
    isEnd: true,
  },
    {
    label: "Login",
    path: ROUTER_URL.CLIENT_ROUTER.LOGIN,
    component: React.lazy(() => import("@/modules/client/auth-client/pages/LoginPage")),
    isEnd: true,
  },
  {
    label: "Register",
    path: ROUTER_URL.CLIENT_ROUTER.REGISTER,
    component: React.lazy(() => import("@/modules/client/auth-client/pages/RegisterPage")),
    isEnd: true,
  },
]
