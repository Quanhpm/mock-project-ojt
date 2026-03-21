import type { OrderStatus } from "../models/order.models";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Bản nháp",
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
