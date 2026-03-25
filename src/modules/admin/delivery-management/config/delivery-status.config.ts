import type { DeliveryStatus } from "../models/delivery-management.models";

export const DELIVERY_STATUS_OPTIONS: Array<{
  label: string;
  value: DeliveryStatus | "";
}> = [
  { label: "Tất cả", value: "" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Picked Up", value: "PICKED_UP" },
  { label: "Delivered", value: "DELIVERED" },
];

const DELIVERY_STATUS_META: Record<
  DeliveryStatus,
  {
    label: string;
    badgeClass: string;
  }
> = {
  ASSIGNED: {
    label: "Assigned",
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  PICKED_UP: {
    label: "Picked Up",
    badgeClass: "bg-sky-50 text-sky-800 ring-sky-200",
  },
  DELIVERED: {
    label: "Delivered",
    badgeClass: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

export const normalizeDeliveryStatusKey = (status: string) => {
  const normalizedStatus = status.trim().toUpperCase().replaceAll("-", "_").replaceAll(" ", "_");

  if (normalizedStatus === "COMPLETED") {
    return "DELIVERED";
  }

  if (normalizedStatus === "PICKUP" || normalizedStatus === "OUT_FOR_DELIVERY") {
    return "PICKED_UP";
  }

  return normalizedStatus;
};

export const getDeliveryStatusLabel = (status: string) => {
  const normalizedStatus = normalizeDeliveryStatusKey(status);

  return (
    DELIVERY_STATUS_META[normalizedStatus as DeliveryStatus]?.label ||
    normalizedStatus.replaceAll("_", " ") ||
    "Unknown"
  );
};

export const getDeliveryStatusBadgeClass = (status: string) => {
  const normalizedStatus = normalizeDeliveryStatusKey(status);

  return (
    DELIVERY_STATUS_META[normalizedStatus as DeliveryStatus]?.badgeClass ||
    "bg-gray-100 text-gray-700 ring-gray-200"
  );
};

export const canPickupDelivery = (status: string) => normalizeDeliveryStatusKey(status) === "ASSIGNED";

export const canCompleteDelivery = (status: string) =>
  normalizeDeliveryStatusKey(status) === "PICKED_UP";

export const isDeliveredDelivery = (status: string) =>
  normalizeDeliveryStatusKey(status) === "DELIVERED";
