import { ROUTER_URL } from "@/routes/router.const";

export type AdminGlobalFranchiseScopeKey =
  | "orders"
  | "order-pos"
  | "staff-queue"
  | "payments"
  | "deliveries";

export const ADMIN_GLOBAL_FRANCHISE_QUERY_KEY = "franchiseId";

const ORDER_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER}`;
const ORDER_POS_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS}`;
const ORDER_POS_REVIEW_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS_REVIEW}`;
const ORDER_STAFF_QUEUE_PATH =
  `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_STAFF_QUEUE}`;
const PAYMENT_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.PAYMENT}`;
const DELIVERY_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DELIVERY}`;

const toRoutePathname = (path: string) => {
  if (!path) {
    return "";
  }

  return new URL(path, "http://codex.local").pathname;
};

const cloneSearchParams = (search: string | URLSearchParams) =>
  new URLSearchParams(search instanceof URLSearchParams ? search.toString() : search);

export const resolveAdminGlobalFranchiseScopeKey = (
  path: string | null | undefined,
): AdminGlobalFranchiseScopeKey | null => {
  const pathname = toRoutePathname(path ?? "");

  if (
    pathname === ORDER_POS_PATH ||
    pathname.startsWith(`${ORDER_POS_PATH}/`) ||
    pathname === ORDER_POS_REVIEW_PATH ||
    pathname.startsWith(`${ORDER_POS_REVIEW_PATH}/`)
  ) {
    return "order-pos";
  }

  if (
    pathname === ORDER_STAFF_QUEUE_PATH ||
    pathname.startsWith(`${ORDER_STAFF_QUEUE_PATH}/`)
  ) {
    return "staff-queue";
  }

  if (pathname === PAYMENT_PATH || pathname.startsWith(`${PAYMENT_PATH}/`)) {
    return "payments";
  }

  if (pathname === DELIVERY_PATH || pathname.startsWith(`${DELIVERY_PATH}/`)) {
    return "deliveries";
  }

  if (pathname === ORDER_PATH || pathname.startsWith(`${ORDER_PATH}/`)) {
    return "orders";
  }

  return null;
};

export const readAdminGlobalFranchiseId = (searchParams: URLSearchParams) =>
  searchParams.get(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY)?.trim() || null;

export const createAdminGlobalFranchiseSearchParams = (
  search: string | URLSearchParams,
  franchiseId: string | null,
) => {
  const nextSearchParams = cloneSearchParams(search);

  if (franchiseId) {
    nextSearchParams.set(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY, franchiseId);
  } else {
    nextSearchParams.delete(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY);
  }

  return nextSearchParams;
};

export const withAdminGlobalFranchiseId = (
  path: string,
  franchiseId: string | null,
) => {
  const targetUrl = new URL(path, "http://codex.local");

  if (franchiseId) {
    targetUrl.searchParams.set(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY, franchiseId);
  } else {
    targetUrl.searchParams.delete(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY);
  }

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
};

export const withoutAdminGlobalFranchiseId = (path: string) => {
  return withAdminGlobalFranchiseId(path, null);
};
