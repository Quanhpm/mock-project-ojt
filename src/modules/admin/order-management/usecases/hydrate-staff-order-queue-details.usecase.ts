import type {
  OrderDetail,
  OrderStatus,
  StaffQueueOrder,
} from "../models/order.models";
import { orderService } from "../services/order.service";

const normalizeHydratedQueueOrder = (
  summary: StaffQueueOrder,
  detail: OrderDetail | null,
  detailLoadFailed = false,
): StaffQueueOrder => {
  if (!detail) {
    return {
      ...summary,
      detailLoadState: detailLoadFailed ? "failed" : "loaded",
      detailLoadFailed,
      order_items: detailLoadFailed ? summary.order_items : [],
    };
  }

  return {
    ...summary,
    _id: detail._id ?? summary._id,
    code: detail.code ?? summary.code,
    status: (detail.status ?? summary.status) as OrderStatus,
    customer_name: detail.customer_name ?? summary.customer_name,
    phone: detail.phone ?? summary.phone,
    franchise_id: detail.franchise_id ?? summary.franchise_id,
    franchise_name: detail.franchise_name ?? summary.franchise_name,
    created_at: summary.created_at || detail.created_at || new Date().toISOString(),
    order_items: detail.order_items ?? [],
    detailLoadState: "loaded",
    detailLoadFailed: false,
  };
};

export const hydrateStaffOrderQueueDetailsUsecase = async (
  orders: StaffQueueOrder[],
  concurrency = 3,
): Promise<StaffQueueOrder[]> => {
  if (orders.length === 0) {
    return [];
  }

  const hydratedOrders: StaffQueueOrder[] = [];

  for (let index = 0; index < orders.length; index += concurrency) {
    const batch = orders.slice(index, index + concurrency);
    const settledResults = await Promise.allSettled(
      batch.map((order) => orderService.getOrderByCode(order.code)),
    );

    batch.forEach((order, batchIndex) => {
      const detailResult = settledResults[batchIndex];

      if (detailResult.status === "fulfilled") {
        hydratedOrders.push(normalizeHydratedQueueOrder(order, detailResult.value));
        return;
      }

      console.error("[StaffOrderQueue] Failed to load detail by code", detailResult.reason);
      hydratedOrders.push(normalizeHydratedQueueOrder(order, null, true));
    });
  }

  return hydratedOrders;
};
