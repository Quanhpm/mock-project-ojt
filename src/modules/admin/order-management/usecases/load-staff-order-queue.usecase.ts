import type {
  FranchiseOrderListItem,
  OrderStatus,
  StaffQueueOrder,
} from "../models/order.models";
import { orderService } from "../services/order.service";

const STAFF_QUEUE_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING"];

const toTimeValue = (value?: string) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const isQueueStatus = (status: OrderStatus) => STAFF_QUEUE_STATUSES.includes(status);

const normalizeQueueOrder = (
  summary: FranchiseOrderListItem,
  franchiseId: string,
): StaffQueueOrder => {
  return {
    _id: summary._id,
    code: summary.code,
    status: summary.status,
    customer_name: summary.customer_name,
    phone: summary.phone,
    franchise_id: franchiseId,
    created_at: summary.created_at || new Date().toISOString(),
    order_items: [],
    detailLoadState: "idle",
    detailLoadFailed: false,
  };
};

export const loadStaffOrderQueueUsecase = async (
  franchiseId: string,
): Promise<StaffQueueOrder[]> => {
  const [confirmedResult, preparingResult] = await Promise.allSettled([
    orderService.getOrdersByFranchise(franchiseId, "CONFIRMED"),
    orderService.getOrdersByFranchise(franchiseId, "PREPARING"),
  ]);

  if (confirmedResult.status === "rejected" && preparingResult.status === "rejected") {
    throw confirmedResult.reason;
  }

  const summaries = [
    ...(confirmedResult.status === "fulfilled" ? confirmedResult.value ?? [] : []),
    ...(preparingResult.status === "fulfilled" ? preparingResult.value ?? [] : []),
  ]
    .filter((order) => isQueueStatus(order.status))
    .sort((left, right) => toTimeValue(right.created_at) - toTimeValue(left.created_at));

  const uniqueSummaries = Array.from(
    new Map(summaries.map((order) => [order._id, order])).values(),
  );

  return uniqueSummaries.map((summary) => normalizeQueueOrder(summary, franchiseId));
};
