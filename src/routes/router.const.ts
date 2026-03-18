export const ROUTER_URL = {
  // ========== PUBLIC ROUTES (Guest có thể truy cập) ==========
  HOME: "/",
  MENU: "/menu",
  MENU_ROUTER: "/product/:slug",
  ABOUT: "/about",
  CONTACT: "/contact",
  VERSION: "/version",
  VERIFY_EMAIL: "/verify-customer-email/:token",
  PROFILE: "/profile",

  // ========== AUTH ROUTES ==========
  CLIENT: "/client",
  CLIENT_ROUTER: {
    LOGIN: "/client/login",
    REGISTER: "/client/register",
    FORGOT_PASSWORD: "/client/forgot-password",
    CHANGE_PASSWORD: "/client/change-password",
  },

  // ========== PRIVATE ROUTES (Cần đăng nhập - ClientGuard) ==========
  HOME_PRIVATE: "/",
  HOME_ROUTER: {
    DASHBOARD: "/",
    CART: "/cart",
    SELECT_FRANCHISE: "/select-franchise",
    FRANCHISE: "/franchise",
    CHECKOUT: "/checkout/:paymentId",
    PROFILE: "/profile",
    CHANGE_PASSWORD: "/change-password",
    ORDER_HISTORY: "/order-history",
    LOCATION: "/location",
    LOCATION_DETAIL: "/location/:franchiseId",
  },

  // ========== ADMIN ROUTES ==========
  ADMIN: "/admin",
  ADMIN_ROUTER: {
    LOGIN: `/admin/login`,
    VERIFY_EMAIL: `/verify-email/:token`,
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
    VOUCHER: `vouchers`,
    PROMOTION: `promotions`,
    SHIFT: `shifts`,
    ACCOUNT: `account`,
    SECURITY: `account/security`,
    SELECT_FRANCHISE: `select-franchise`,
    PRODUCT_FRANCHISE: `franchises/:franchiseId/products`,
  },
};
