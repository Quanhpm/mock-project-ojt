import { Loader2 } from "lucide-react";
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS } from "../../config/order-status.config";
import type { OrderItem, StaffQueueOrder } from "../../models/order.models";
import { cn } from "@/utils/cn";

interface StaffOrderQueueDetailPanelProps {
  order?: StaffQueueOrder;
  isPageLoading?: boolean;
  isUpdating?: boolean;
  onMarkPreparing: (order: StaffQueueOrder) => void;
  onMarkReadyForPickup: (order: StaffQueueOrder) => void;
}

const formatCreatedAt = (value: string) => {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const resolveActionLabel = (status: StaffQueueOrder["status"]) => {
  if (status === "PREPARING") {
    return "Ready to pickup";
  }

  return "Start Preparing";
};

const renderItemCard = (item: OrderItem, keyPrefix = "item") => {
  return (
    <div
      key={`${keyPrefix}-${item.order_item_id}`}
      className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
    >
      <div className="flex items-start gap-4">
        {item.product_image_url ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-black/5">
            <img
              src={item.product_image_url}
              alt={item.product_name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 ring-1 ring-black/5">
            No Img
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-base font-black text-amber-800 ring-1 ring-amber-700/15">
              {item.quantity}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-base font-bold leading-tight tracking-tight text-gray-900">
                {item.product_name}
              </p>

              {item.options.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {item.options.map((option) => (
                    <span
                      key={`${item.order_item_id}-${option.product_franchise_id}-${option.product_name}`}
                      className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-600 ring-1 ring-gray-200"
                    >
                      {option.product_name}{" "}
                      <span className="text-amber-700">x{option.quantity}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs font-medium text-gray-400">Không có tuỳ chọn thêm</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const renderLoadingState = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`loading-${index}`}
          className="animate-pulse rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-black/5"
        >
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-200/70" />
            <div className="min-w-0 flex-1 space-y-3 py-1">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gray-200/70" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-3/5 rounded-full bg-gray-200" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="h-6 w-24 rounded-lg bg-gray-100 ring-1 ring-gray-200" />
                    <div className="h-6 w-20 rounded-lg bg-gray-100 ring-1 ring-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StaffOrderQueueDetailPanel = ({
  order,
  isPageLoading = false,
  isUpdating = false,
  onMarkPreparing,
  onMarkReadyForPickup,
}: StaffOrderQueueDetailPanelProps) => {
  if (isPageLoading && !order) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-[28px] border border-gray-200 bg-gray-50 p-6 shadow-sm ring-1 ring-black/5">
          <div className="h-4 w-24 rounded-full bg-gray-200" />
          <div className="mt-4 h-10 w-1/2 rounded-full bg-gray-200" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="h-24 rounded-2xl bg-white/80" />
            <div className="h-24 rounded-2xl bg-white/80" />
          </div>
        </div>
        {renderLoadingState()}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[400px] h-full flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
          <p className="text-3xl">☕</p>
        </div>
        <p className="text-xl font-bold text-gray-900">Chi tiết order queue</p>
        <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
          Chọn một order ở cột bên trái để xem món, tuỳ chọn và thao tác xử lý tiếp theo.
        </p>
      </div>
    );
  }

  const isPreparingAction = order.status === "CONFIRMED";
  const isDetailLoading = order.detailLoadState === "loading";
  const isDetailIdle = order.detailLoadState === "idle";
  const hasLoadedDetails = order.detailLoadState === "loaded";
  const detailCountLabel =
    order.detailLoadState === "loaded" ? `${order.order_items.length} món` : "Đang đồng bộ món";

  const handleAction = () => {
    if (order.status === "PREPARING") {
      onMarkReadyForPickup(order);
      return;
    }

    onMarkPreparing(order);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-white via-white to-amber-50/30 p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
              Staff Queue Detail
            </p>
            <h2 className="mt-3 break-all text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              {order.code}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500">
              <span>{formatCreatedAt(order.created_at)}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{formatElapsedTime(order.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5",
                ORDER_STATUS_BADGES[order.status],
              )}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-700/10">
              {detailCountLabel}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-gray-50/90 px-4 py-4 ring-1 ring-black/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Khách hàng</p>
            <p className="mt-2 text-lg font-black tracking-tight text-gray-900">
              {order.customer_name || "Khách vãng lai"}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {order.phone || "Chưa có số điện thoại"}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50/90 px-4 py-4 ring-1 ring-black/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Chi nhánh</p>
            <p className="mt-2 text-lg font-black tracking-tight text-gray-900">
              {order.franchise_name || "Theo franchise hiện tại"}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Trạng thái hiện tại: {ORDER_STATUS_LABELS[order.status]}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleAction}
            disabled={isUpdating}
            className={cn(
              "group flex h-14 w-full items-center justify-center rounded-2xl px-6 text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-0",
              isPreparingAction
                ? "bg-gray-50 text-gray-900 ring-1 ring-gray-200 hover:bg-white hover:shadow-md hover:ring-amber-600/20"
                : "bg-amber-700 text-white shadow-lg shadow-amber-700/20 hover:bg-amber-800",
            )}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
                Đang cập nhật
              </span>
            ) : (
              resolveActionLabel(order.status)
            )}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
              Món trong đơn
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
              Chi tiết chế biến
            </h3>
          </div>
        </div>

        {isDetailLoading ? (
          renderLoadingState()
        ) : isDetailIdle ? (
          <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-lg font-bold text-gray-900">Chi tiết món đang được tải</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Queue đang hydrate dữ liệu theo từng nhóm nhỏ để tránh gọi quá nhiều API cùng lúc.
            </p>
          </div>
        ) : hasLoadedDetails && order.order_items.length > 0 ? (
          <div className="space-y-4">
            {order.order_items.map((item) => renderItemCard(item))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-lg font-bold text-gray-900">
              {order.detailLoadFailed ? "Không tải được chi tiết món" : "Đơn hàng chưa có món"}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {order.detailLoadFailed
                ? "Bạn có thể thử tải lại trang hoặc chọn lại đơn hàng sau."
                : "Hiện chưa có item nào để hiển thị trong order này."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default StaffOrderQueueDetailPanel;
