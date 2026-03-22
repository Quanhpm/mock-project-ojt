import type { CartStatus } from "../models/cart.models";
import type { OrderStatus, PaymentStatus } from "../models/order.models";

export const CART_STATUS_VALUES: CartStatus[] = ["ACTIVE", "CHECKED_OUT", "CANCELED"];
export const ORDER_STATUS_VALUES: OrderStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELED",
];
export const PAYMENT_STATUS_VALUES: PaymentStatus[] = ["PENDING", "PAID", "REFUNDED"];

export const CART_STATUS_LABELS: Record<CartStatus, string> = {
  ACTIVE: "Đang hoạt động",
  CHECKED_OUT: "Đã checkout",
  CANCELED: "Đã hủy",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Chưa thanh toán",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_FOR_PICKUP: "Sẵn sàng lấy",
  OUT_FOR_DELIVERY: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

export const ORDER_STATUS_BADGES: Record<OrderStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-amber-50 text-amber-800",
  READY_FOR_PICKUP: "bg-emerald-50 text-emerald-700",
  OUT_FOR_DELIVERY: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELED: "bg-rose-50 text-rose-700",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_BADGES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  PAID: "bg-emerald-50 text-emerald-700",
  REFUNDED: "bg-slate-100 text-slate-700",
};

export const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus | ""; label: string }> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: ORDER_STATUS_LABELS.DRAFT },
  { value: "CONFIRMED", label: ORDER_STATUS_LABELS.CONFIRMED },
  { value: "PREPARING", label: ORDER_STATUS_LABELS.PREPARING },
  { value: "READY_FOR_PICKUP", label: ORDER_STATUS_LABELS.READY_FOR_PICKUP },
  { value: "OUT_FOR_DELIVERY", label: ORDER_STATUS_LABELS.OUT_FOR_DELIVERY },
  { value: "COMPLETED", label: ORDER_STATUS_LABELS.COMPLETED },
  { value: "CANCELED", label: ORDER_STATUS_LABELS.CANCELED },
];

export const ORDER_PROGRESS_FLOW: OrderStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["PREPARING", "CANCELED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELED"],
  READY_FOR_PICKUP: ["OUT_FOR_DELIVERY", "COMPLETED"],
  OUT_FOR_DELIVERY: ["COMPLETED"],
  COMPLETED: [],
  CANCELED: [],
};

interface OrderTransitionGuardInput {
  currentStatus: OrderStatus;
  nextStatus: OrderStatus;
  paymentStatus?: PaymentStatus | null;
}

export const canTransitionOrderStatus = ({
  currentStatus,
  nextStatus,
  paymentStatus,
}: OrderTransitionGuardInput) => {
  const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    return false;
  }

  if (currentStatus === "DRAFT" && nextStatus === "CONFIRMED") {
    return paymentStatus === "PAID";
  }

  return true;
};
