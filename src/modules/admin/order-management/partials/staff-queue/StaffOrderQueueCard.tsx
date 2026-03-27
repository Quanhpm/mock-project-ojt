import { useState } from "react";
import { Loader2, ChevronDown, X } from "lucide-react";
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS } from "../../config/order-status.config";
import type { StaffQueueOrder } from "../../models/order.models";
import { cn } from "@/utils/cn";

interface StaffOrderQueueCardProps {
  order: StaffQueueOrder;
  isUpdating?: boolean;
  onMarkPreparing: (order: StaffQueueOrder) => void;
  onMarkReadyForPickup: (order: StaffQueueOrder) => void;
}

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

const formatCreatedAt = (value: string) => {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const resolveActionLabel = (status: StaffQueueOrder["status"]) => {
  if (status === "PREPARING") {
    return "Ready to pickup";
  }

  return "Start Preparing";
};

export const StaffOrderQueueCard = ({
  order,
  isUpdating = false,
  onMarkPreparing,
  onMarkReadyForPickup,
}: StaffOrderQueueCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPreparingAction = order.status === "CONFIRMED";
  const isDetailLoading = order.detailLoadState === "loading";
  const isDetailIdle = order.detailLoadState === "idle";
  const hasLoadedDetails = order.detailLoadState === "loaded";

  const handleAction = () => {
    if (order.status === "PREPARING") {
      onMarkReadyForPickup(order);
      return;
    }

    onMarkPreparing(order);
  };

  const hiddenCount = Math.max(0, order.order_items.length - 3);
  const displayItems = order.order_items.slice(0, 3);

  return (
    <>
      <article className="relative z-10 flex min-h-[520px] flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md md:p-6 lg:h-[580px]">
        {/* Header: Order Code + Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order ID</p>
            <h2 className="mt-2 break-all text-2xl font-black leading-none tracking-tight text-gray-900">
              {order.code}
            </h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {formatCreatedAt(order.created_at)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5 ${ORDER_STATUS_BADGES[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-700/10">
              {formatElapsedTime(order.created_at)}
            </span>
          </div>
        </div>

        {/* Customer Info Bar */}
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-black/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700 ring-1 ring-amber-700/10">
              {(order.customer_name || "K")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {order.customer_name || "Khách vãng lai"}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {order.phone || "Chưa có số điện thoại"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-1.5 ring-1 ring-gray-200 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Món</p>
            <p className="text-lg font-black text-amber-800">{order.order_items.length}</p>
          </div>
        </div>

        {/* Items List */}
        <div className="relative mt-5 flex flex-1 flex-col min-h-0">
          <div className={cn("flex-1 space-y-2.5 overflow-y-auto pr-2 scrollbar-hide", hiddenCount > 0 ? "pb-14" : "")}>
            {isDetailLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`loading-${order._id}-${index}`}
                  className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5"
                >
                  <div className="flex items-start gap-4 animate-pulse">
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-gray-200/60" />

                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 shrink-0 rounded-lg bg-gray-200/70" />
                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-4/5 rounded-full bg-gray-200" />
                          <div className="mt-2 flex flex-wrap gap-2">
                            <div className="h-5 w-16 rounded-lg bg-gray-100 ring-1 ring-gray-200" />
                            <div className="h-5 w-20 rounded-lg bg-gray-100 ring-1 ring-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : isDetailIdle ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-sm leading-relaxed text-gray-500">
                <p className="font-bold text-gray-900">Chi tiết món sẽ được tải khi bạn cuộn đến thẻ này</p>
                <p className="mt-2 text-xs text-gray-400">
                  Queue đang nạp theo từng nhóm nhỏ để tránh gọi quá nhiều API cùng lúc.
                </p>
              </div>
            ) : hasLoadedDetails && order.order_items.length > 0 ? (
              displayItems.map((item) => (
                <div
                  key={item.order_item_id}
                  className="rounded-2xl bg-gray-50/80 p-3.5 ring-1 ring-black/5 transition-colors hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    {item.product_image_url ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-black/5">
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-[9px] font-bold uppercase tracking-wider text-gray-400 ring-1 ring-black/5">
                        No Img
                      </div>
                    )}

                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-sm font-black text-amber-800 ring-1 ring-amber-700/15">
                          {item.quantity}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-tight tracking-tight text-gray-900">
                            {item.product_name}
                          </p>

                          {item.options.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.options.map((option) => (
                                <span
                                  key={`${item.order_item_id}-${option.product_franchise_id}-${option.product_name}`}
                                  className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 ring-1 ring-gray-200"
                                >
                                  {option.product_name} <span className="text-amber-700">x{option.quantity}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-sm leading-relaxed text-gray-500">
                <p className="font-bold text-gray-900">
                  {order.detailLoadFailed ? "Không tải được chi tiết món" : "Chưa có món trong đơn"}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {order.detailLoadFailed
                    ? "Bạn có thể thử tải lại khi quay lại trang."
                    : "Đơn hàng này chưa có item nào để hiển thị."}
                </p>
              </div>
            )}
          </div>

          {hiddenCount > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent pt-10 pb-1 pr-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-50 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-800 ring-1 ring-black/5 transition-colors hover:bg-amber-50 hover:ring-amber-700/10"
              >
                <ChevronDown size={14} strokeWidth={2.5} /> Xem thêm {hiddenCount} chi tiết món
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-5 shrink-0 pt-2 relative z-20">
          <button
            type="button"
            onClick={handleAction}
            disabled={isUpdating}
            className={`group flex h-14 w-full items-center justify-center rounded-2xl px-6 text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-0 ${
              isPreparingAction
                ? "bg-gray-50 text-gray-900 ring-1 ring-gray-200 hover:bg-white hover:shadow-md hover:ring-amber-600/20"
                : "bg-amber-700 text-white shadow-lg shadow-amber-700/20 hover:bg-amber-800"
            }`}
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
      </article>

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 py-3 backdrop-blur-sm transition-opacity sm:items-center sm:px-4 sm:py-6">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200 sm:max-h-[85vh]">
            {/* Modal Header */}
            <div className="shrink-0 border-b border-gray-200 bg-gray-50/80 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Chi tiết sản phẩm</h3>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Mã đơn <span className="font-bold text-amber-800">{order.code}</span> • {order.order_items.length} phần
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-white p-5 sm:p-8">
              {order.order_items.map((item) => (
                <div
                  key={`modal-${item.order_item_id}`}
                  className="rounded-2xl bg-gray-50/80 p-5 ring-1 ring-black/5 transition-colors hover:bg-white hover:shadow-sm"
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

                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-start gap-3">
                        <div className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-base font-black text-amber-800 ring-1 ring-amber-700/15">
                          {item.quantity}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold leading-tight tracking-tight text-gray-900">
                            {item.product_name}
                          </p>

                          {item.options.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {item.options.map((option) => (
                                <span
                                  key={`modal-${item.order_item_id}-${option.product_franchise_id}-${option.product_name}`}
                                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-600 ring-1 ring-gray-200"
                                >
                                  {option.product_name} <span className="text-amber-700">x{option.quantity}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-5 py-4 sm:flex sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-900 sm:w-auto sm:min-w-[140px]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffOrderQueueCard;
