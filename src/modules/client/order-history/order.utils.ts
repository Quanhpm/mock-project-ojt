import { statusConfig } from './order.config';
import type { OrderData, OrdersResponse } from './order.types';

export const EMPTY_SUMMARY: OrdersResponse['data']['summary'] = {
  total_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  preparing_orders: 0,
  total_revenue: {
    value: 0,
    currency: 'VND',
  },
};

interface RawOrderItemOptionApi {
  _id?: string;
  id?: string | number;
  product_name?: string;
  option_name?: string;
  name?: string;
  quantity?: number;
  price_snapshot?: number;
  final_line_total?: number;
}

interface RawOrderItemApi {
  _id?: string;
  id?: string | number;
  product_name?: string;
  product_image_url?: string;
  quantity?: number;
  price_snapshot?: number;
  final_line_total?: number;
  options?: RawOrderItemOptionApi[];
}

interface RawOrderApi {
  _id?: string;
  id?: string | number;
  code?: string;
  franchise_id?: string;
  franchise_name?: string;
  status?: string | { code?: string; label?: string; color?: string };
  final_amount?: number;
  subtotal_amount?: number;
  promotion_discount?: number;
  voucher_discount?: number;
  message?: string;
  failed_reason?: string;
  created_at?: string;
  updated_at?: string;
  order_items?: RawOrderItemApi[];
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const mapRawOrderItemOption = (
  option: RawOrderItemOptionApi,
  parentIndex: number,
  optionIndex: number,
) => {
  const quantity = toNumber(option.quantity, 1);
  const priceSnapshot = toNumber(option.price_snapshot, 0);
  const finalLineTotal = toNumber(option.final_line_total, priceSnapshot * quantity);

  return {
    id: String(option._id ?? option.id ?? `option-${parentIndex}-${optionIndex}`),
    name: option.product_name ?? option.option_name ?? option.name ?? 'Tùy chọn khác',
    quantity,
    priceSnapshot,
    finalLineTotal,
  };
};

const mapRawOrderItem = (item: RawOrderItemApi, index: number) => {
  const quantity = toNumber(item.quantity, 0);
  const priceSnapshot = toNumber(item.price_snapshot, 0);
  const options = Array.isArray(item.options)
    ? item.options.map((option, optionIndex) => mapRawOrderItemOption(option, index, optionIndex))
    : [];
  const finalLineTotal = toNumber(item.final_line_total, priceSnapshot * quantity);

  return {
    id: String(item._id ?? item.id ?? `item-${index}`),
    productName: item.product_name ?? 'Sản phẩm',
    productImageUrl: item.product_image_url ?? '',
    quantity,
    priceSnapshot,
    finalLineTotal,
    options,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const normalizeStatusCode = (status: RawOrderApi['status']): string => {
  if (typeof status === 'string') {
    return status.toUpperCase();
  }

  if (isRecord(status) && typeof status.code === 'string') {
    return status.code.toUpperCase();
  }

  return '';
};

const mapBackendStatusToUi = (status?: RawOrderApi['status']): OrderData['status']['code'] => {
  const normalized = normalizeStatusCode(status);

  if (normalized === 'COMPLETED' || normalized === 'DELIVERED') {
    return 'COMPLETED';
  }

  if (normalized === 'CANCELLED' || normalized === 'CANCELED' || normalized === 'FAILED') {
    return 'CANCELLED';
  }

  if (normalized === 'PREPARING' || normalized === 'PROCESSING') {
    return 'PREPARING';
  }

  if (normalized === 'READY_FOR_PICKUP') {
    return 'READY_FOR_PICKUP';
  }

  if (
    normalized === 'CONFIRMED' ||
    normalized === 'PENDING'
  ) {
    return 'CONFIRMED';
  }

  return 'DRAFT';
};

const mapRawOrderToUiOrder = (rawOrder: RawOrderApi): OrderData => {
  const statusCode = mapBackendStatusToUi(rawOrder.status);
  const mappedItems = Array.isArray(rawOrder.order_items)
    ? rawOrder.order_items.map((item, index) => mapRawOrderItem(item, index))
    : [];
  const itemsCount = Array.isArray(rawOrder.order_items)
    ? rawOrder.order_items.reduce((total, item) => total + (item.quantity || 0), 0)
    : 0;

  return {
    id: rawOrder._id ?? rawOrder.id ?? rawOrder.code ?? 'UNKNOWN_ORDER',
    code: rawOrder.code ?? 'UNKNOWN',
    store: {
      id: rawOrder.franchise_id ?? 'UNKNOWN_FRANCHISE',
      name: rawOrder.franchise_name ?? 'Không rõ cửa hàng',
    },
    channel: 'ONLINE',
    status: {
      code: statusCode,
      label: statusConfig[statusCode].label,
      color: statusConfig[statusCode].textColor,
    },
    pricing: {
      total: rawOrder.final_amount ?? rawOrder.subtotal_amount ?? 0,
      currency: 'VND',
      subtotal: rawOrder.subtotal_amount ?? rawOrder.final_amount ?? 0,
      promotionDiscount: rawOrder.promotion_discount ?? 0,
      voucherDiscount: rawOrder.voucher_discount ?? 0,
      finalAmount: rawOrder.final_amount ?? rawOrder.subtotal_amount ?? 0,
    },
    meta: {
      items_count: itemsCount,
      created_at: rawOrder.created_at ?? rawOrder.updated_at ?? new Date().toISOString(),
    },
    cancelReason: rawOrder.failed_reason ?? null,
    message: rawOrder.message ?? null,
    orderItems: mappedItems,
  };
};

const extractOrdersAndSummary = (
  payload: unknown,
  depth = 0,
): { orders: unknown[]; summary?: OrdersResponse['data']['summary'] } => {
  if (depth > 5) {
    return { orders: [] };
  }

  if (Array.isArray(payload)) {
    return { orders: payload };
  }

  if (!isRecord(payload)) {
    return { orders: [] };
  }

  const summary = isRecord(payload.summary)
    ? (payload.summary as OrdersResponse['data']['summary'])
    : undefined;

  // Handle real API shape: { success: true, data: [...] }
  if (payload.success === true && Array.isArray(payload.data)) {
    return { orders: payload.data, summary };
  }

  const directArrayKeys = ['orders', 'data', 'items', 'results', 'list'];
  for (const key of directArrayKeys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return { orders: value, summary };
    }
  }

  const nestedKeys = ['data', 'payload', 'result'];
  for (const key of nestedKeys) {
    const nested = payload[key];
    if (!isRecord(nested) && !Array.isArray(nested)) {
      continue;
    }

    const extracted = extractOrdersAndSummary(nested, depth + 1);
    if (extracted.orders.length > 0 || extracted.summary) {
      return {
        orders: extracted.orders,
        summary: extracted.summary ?? summary,
      };
    }
  }

  return { orders: [], summary };
};

export const buildSummaryFromOrders = (
  orders: OrderData[],
): OrdersResponse['data']['summary'] => {
  return {
    total_orders: orders.length,
    completed_orders: orders.filter((order) => order.status.code === 'COMPLETED').length,
    cancelled_orders: orders.filter((order) => order.status.code === 'CANCELLED').length,
    preparing_orders: orders.filter(
      (order) =>
        order.status.code === 'DRAFT' ||
        order.status.code === 'PREPARING' ||
        order.status.code === 'CONFIRMED' ||
        order.status.code === 'READY_FOR_PICKUP',
    ).length,
    total_revenue: {
      value: orders.reduce((total, order) => total + order.pricing.total, 0),
      currency: 'VND',
    },
  };
};

export interface NormalizedOrdersPayload {
  orders: OrderData[];
  summary: OrdersResponse['data']['summary'] | null;
}

export const normalizeOrdersPayload = (payload: unknown): NormalizedOrdersPayload => {
  const extracted = extractOrdersAndSummary(payload);
  const orders = extracted.orders.map((order) => mapRawOrderToUiOrder(order as RawOrderApi));

  return {
    orders,
    summary: extracted.summary ?? null,
  };
};
