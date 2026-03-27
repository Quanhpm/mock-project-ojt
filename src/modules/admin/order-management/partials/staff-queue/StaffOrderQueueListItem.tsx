import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS } from "../../config/order-status.config";
import type { StaffQueueOrder } from "../../models/order.models";
import { cn } from "@/utils/cn";

interface StaffOrderQueueListItemProps {
  order: StaffQueueOrder;
  isSelected?: boolean;
  onClick: () => void;
}

const formatCreatedAt = (value: string) => {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatElapsedTime = (value: string) => {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Vừa tạo";
  }

  const diffInMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

  if (diffInMinutes < 1) {
    return "Vừa tạo";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const hours = Math.floor(diffInMinutes / 60);

  if (hours < 24) {
    return `${hours} giờ trước`;
  }

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const resolveItemCountLabel = (order: StaffQueueOrder) => {
  if (order.detailLoadState === "loaded") {
    return `${order.order_items.length} món`;
  }

  if (order.detailLoadState === "loading") {
    return "Đang tải món";
  }

  if (order.detailLoadState === "failed") {
    return "Lỗi tải món";
  }

  return "Chờ tải món";
};

export const StaffOrderQueueListItem = ({
  order,
  isSelected = false,
  onClick,
}: StaffOrderQueueListItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-[24px] border p-5 text-left transition-all active:scale-[0.98]",
        isSelected
          ? "border-amber-200 bg-amber-50/60 shadow-md ring-2 ring-amber-600/20"
          : "border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:bg-gray-50/80 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-black tracking-tight text-gray-900">
              {order.code}
            </p>
            {isSelected ? (
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
            ) : null}
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {formatCreatedAt(order.created_at)}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5",
            ORDER_STATUS_BADGES[order.status],
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50/80 px-4 py-3 ring-1 ring-black/5">
        <p className="truncate text-sm font-bold text-gray-900">
          {order.customer_name || "Khách vãng lai"}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
          <span>{formatElapsedTime(order.created_at)}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span>{resolveItemCountLabel(order)}</span>
        </div>
      </div>

      {isSelected ? <div className="absolute left-0 top-0 h-full w-1 bg-amber-600" /> : null}
    </button>
  );
};

export default StaffOrderQueueListItem;
