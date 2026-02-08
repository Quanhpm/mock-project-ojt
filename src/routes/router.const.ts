export const ROUTER_URL = {
  // ========== PUBLIC ROUTES (Guest có thể truy cập) ==========
  HOME: "/",
  MENU: "/menu",
  MENU_ROUTER: "/product/:slug",
  ABOUT: "/about",
  CONTACT: "/contact",
  VERSION: "/version",

  // ========== AUTH ROUTES ==========
  CLIENT: "/client",
  CLIENT_ROUTER: {
    LOGIN: "/client/login",
    REGISTER: "/client/register",
    FORGOT_PASSWORD: "/client/forgot-password",
  },

  // ========== PRIVATE ROUTES (Cần đăng nhập - ClientGuard) ==========
  HOME_PRIVATE: "/home",
  HOME_ROUTER: {
    DASHBOARD: "/home",
    CART: "/home/cart",
    SELECT_FRANCHISE: "/home/select-franchise",
    CHECKOUT: "/home/checkout",
    PROFILE: "/home/profile",
    CHANGE_PASSWORD: "/home/change-password",
    ORDER_HISTORY: "/home/order-history",
  },

  // ========== ADMIN ROUTES ==========
  ADMIN: "/admin",
  ADMIN_ROUTER: {
    LOGIN: `/admin/login`,
    FORGOT_PASSWORD: `/admin/forgot-password`,
    DASHBOARD: `dashboard`,
    USER: `users`,
    CATEGORY: `categories`,
    PRODUCT: `products`,
    ORDER: `orders`,
    FRANCHISE: `franchises`,
    CUSTOMER: `customers`,
    CART: `cart`,
    LOYALTY: `loyalty`,
    PAYMENT: `payments`,
    INVENTORY: `inventory`,
    ACCOUNT: `account`,
  },
};
