import {
  LayoutDashboard,
  Package,
  Store,
  Users,
  Warehouse,
  UserCircle,
  ShoppingCart,
  Clock,
} from "lucide-react";
import React from "react";
import { ROUTER_URL } from "../router.const";


export type AdminMenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  component: React.LazyExoticComponent<React.FC<any>>;
  isEnd?: boolean;
  module: string;
  hideFromSidebar?: boolean; // ← ADD: Ẩn khỏi sidebar
};

/* TODO: auth pages: login, verify token, reset password, change password */
export const ADMIN_MENU: AdminMenuItem[] = [
  {
    label: "Dashboard",
    path: ROUTER_URL.ADMIN_ROUTER.DASHBOARD,
    icon: <LayoutDashboard size={16} />,
    component: React.lazy(() => import("@/modules/admin/dashboard/pages/DashboardPage")),
    module: "dashboard",
    isEnd: true,
  },
  {
    label: "Users",
    path: ROUTER_URL.ADMIN_ROUTER.USER,
    icon: <Users size={18} />,
    component: React.lazy(() => import("@/modules/admin/user-management/pages/UserManagement")),
    module: "users", 
  },
  {
    label: "Franchise",
    path: ROUTER_URL.ADMIN_ROUTER.FRANCHISE,
    icon: <Store size={18} />,
    component: React.lazy(() => import("@/modules/admin/franchise-management/pages/FranchiseManagement")),
    module: "franchise",
  },
  {
    label: "Create Franchise",
    path: `${ROUTER_URL.ADMIN_ROUTER.FRANCHISE}/create`,
    icon: <Store size={18} />,
    component: React.lazy(() => import("@/modules/admin/franchise-management/pages/FranchiseCreatePage")),
    module: "franchise",
    hideFromSidebar: true, // ← Ẩn khỏi sidebar
  },
  {
    label: "Products",
    path: ROUTER_URL.ADMIN_ROUTER.PRODUCT,
    icon: <Package size={18} />,
    component: React.lazy(() => import("@/modules/admin/product-management/pages/ProductListPage")),
    module: "products",     // ✨ ADD
  },
  {
    label: "Inventory",
    path: ROUTER_URL.ADMIN_ROUTER.INVENTORY,
    icon: <Warehouse size={18} />,
    component: React.lazy(() => import("@/modules/admin/inventory-management/pages/InventoryListPage")),
    module: "inventory",   
  },
  {
    label: "Create Inventory",
    path: `${ROUTER_URL.ADMIN_ROUTER.INVENTORY}/create`,
    icon: <Warehouse size={18} />,
    component: React.lazy(() => import("@/modules/admin/inventory-management/pages/InventoryCreatePage")),
    module: "inventory",
    hideFromSidebar: true,
  },
  {
    label: "Edit Inventory",
    path: `${ROUTER_URL.ADMIN_ROUTER.INVENTORY}/edit/:id`,
    icon: <Warehouse size={18} />,
    component: React.lazy(() => import("@/modules/admin/inventory-management/pages/InventoryActionPage")),
    module: "inventory",
    hideFromSidebar: true,
  },
  {
    label: "Customers",
    path: ROUTER_URL.ADMIN_ROUTER.CUSTOMER,
    icon: <UserCircle size={18} />,
    component: React.lazy(() => import("@/modules/admin/customer-management/pages/CustomerManagement")),
    module: "customers",
  },
  {
    label: "Orders",
    path: ROUTER_URL.ADMIN_ROUTER.ORDER,
    icon: <ShoppingCart size={18} />,
    component: React.lazy(() => import("@/modules/admin/order-management/pages/OrderManagement")),
    module: "orders",
  },
  {
    label: "Shifts",
    path: ROUTER_URL.ADMIN_ROUTER.SHIFT,
    icon: <Clock size={18} />,
    component: React.lazy(() => import("@/modules/admin/shift-management/pages/ShiftManagement")),
    module: "shifts",
  },
  {
    label: "Create Product",
    path: `${ROUTER_URL.ADMIN_ROUTER.PRODUCT}/create`,
    icon: <Package size={18} />,
    component: React.lazy(() => import("@/modules/admin/product-management/pages/ProductCreatePage")),
    module: "products",
    hideFromSidebar: true, // ← Ẩn khỏi sidebar
  },
  {
    label: "Edit Product",
    path: `${ROUTER_URL.ADMIN_ROUTER.PRODUCT}/edit/:id`,
    icon: <Package size={18} />,
    component: React.lazy(() => import("@/modules/admin/product-management/pages/ProductActionPage")),
    module: "products",
    hideFromSidebar: true, // ← Ẩn khỏi sidebar
  },
  
  // {
  //   label: "Orders",
  //   path: ROUTER_URL.ADMIN_ROUTER.ORDER,
  //   icon: <ShoppingCart size={18} />,
  //   component: React.lazy(() => import("@/pages/admin/order/Order.page")),
  // },
  // {
  //   label: "Payments",
  //   path: ROUTER_URL.ADMIN_ROUTER.PAYMENT,
  //   icon: <CreditCard size={18} />,
  //   component: React.lazy(() => import("@/pages/admin/payment/Payment.page")),
  // },
  // {
  //   label: "Loyalty",
  //   path: ROUTER_URL.ADMIN_ROUTER.LOYALTY,
  //   icon: <Gift size={18} />,
  //   component: React.lazy(() => import("@/pages/admin/loyalty/Loyalty.page")),
  // },
];
