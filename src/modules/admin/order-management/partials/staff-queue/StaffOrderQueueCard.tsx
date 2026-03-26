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
      <article className="relative z-10 flex min-h-[520px] flex-col overflow-hidden rounded-[32px] border border-[#EDE5D8] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition hover:shadow-lg md:p-6 lg:h-[580px]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">Order ID</p>
            <h2 className="mt-2.5 break-all text-[1.8rem] font-black leading-none tracking-tight text-gray-900">
              {order.code}
            </h2>
            <p className="mt-2.5 text-[0.7rem] font-black uppercase tracking-[0.15em] text-gray-400">
              {formatCreatedAt(order.created_at)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2.5">
            <span
              className={`rounded-xl px-3.5 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.15em] ${ORDER_STATUS_BADGES[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 px-3.5 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.15em] text-[#C85712] ring-1 ring-[#C85712]/10">
              {formatElapsedTime(order.created_at)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-[24px] bg-gradient-to-r from-[#FCFBF8] to-[#FDFCF9] px-5 py-3 ring-1 ring-inset ring-[#EDE5D8]">
          <div className="min-w-0">
            <p className="truncate text-[0.95rem] font-black tracking-tight text-gray-900">
              {order.customer_name || "Khách vãng lai"}
            </p>
            <p className="mt-1 text-[0.8rem] font-semibold text-gray-500">
              {order.phone || "Chưa có số điện thoại"}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[16px] bg-white px-4 py-2 ring-1 ring-inset ring-[#EDE5D8] shadow-sm">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">Món</p>
            <p className="mt-0.5 text-xl font-black text-[#C85712]">{order.order_items.length}</p>
          </div>
        </div>

        <div className="relative mt-6 flex flex-1 flex-col min-h-0">
          <div className={cn("flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide", hiddenCount > 0 ? "pb-16" : "")}>
            {isDetailLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`loading-${order._id}-${index}`}
                  className="rounded-[24px] bg-[#FCFBF8] p-4 ring-1 ring-inset ring-[#EDE5D8]"
                >
                  <div className="flex items-start gap-4 animate-pulse">
                    <div className="h-16 w-16 shrink-0 rounded-[20px] bg-orange-100/60" />

                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-[12px] bg-orange-100/70" />
                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-4/5 rounded-full bg-gray-200" />
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <div className="h-6 w-20 rounded-[10px] bg-white ring-1 ring-inset ring-gray-200" />
                            <div className="h-6 w-24 rounded-[10px] bg-white ring-1 ring-inset ring-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : isDetailIdle ? (
              <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[#EDE5D8] bg-[#FDFCF9] px-4 py-8 text-center text-[0.95rem] leading-relaxed text-gray-500 shadow-sm">
                <p className="font-black text-gray-900">Chi tiết món sẽ được tải khi bạn cuộn đến thẻ này</p>
                <p className="mt-2 text-[0.85rem]">
                  Queue đang nạp theo từng nhóm nhỏ để tránh gọi quá nhiều API cùng lúc.
                </p>
              </div>
            ) : hasLoadedDetails && order.order_items.length > 0 ? (
              displayItems.map((item) => (
                <div
                  key={item.order_item_id}
                  className="rounded-[24px] bg-[#FCFBF8] p-4 ring-1 ring-inset ring-[#EDE5D8] transition-colors hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {item.product_image_url ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[20px] shadow-sm ring-1 ring-inset ring-black/5">
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-gray-50 to-gray-100 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 ring-1 ring-inset ring-gray-200/50">
                        No Img
                      </div>
                    )}

                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-orange-50 text-[1rem] font-black text-[#C85712] ring-1 ring-[#C85712]/20">
                          {item.quantity}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[1.05rem] font-black leading-tight tracking-tight text-gray-900">
                            {item.product_name}
                          </p>

                          {item.options.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {item.options.map((option) => (
                                <span
                                  key={`${item.order_item_id}-${option.product_franchise_id}-${option.product_name}`}
                                  className="rounded-[10px] bg-white px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] text-gray-500 ring-1 ring-inset ring-gray-200"
                                >
                                  {option.product_name} <span className="text-[#C85712]">x{option.quantity}</span>
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
              <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[#EDE5D8] bg-[#FDFCF9] px-4 py-8 text-center text-[0.95rem] leading-relaxed text-gray-500 shadow-sm">
                <p className="font-black text-gray-900">
                  {order.detailLoadFailed ? "Không tải được chi tiết món" : "Chưa có món trong đơn"}
                </p>
                <p className="mt-2 text-[0.85rem]">
                  {order.detailLoadFailed
                    ? "Bạn có thể thử tải lại khi quay lại trang."
                    : "Đơn hàng này chưa có item nào để hiển thị."}
                </p>
              </div>
            )}
          </div>

          {hiddenCount > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-1 pr-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-50/80 backdrop-blur-md py-3 text-[0.75rem] font-black uppercase tracking-[0.15em] text-[#C85712] shadow-sm ring-1 ring-[#C85712]/10 transition-colors hover:bg-orange-100"
              >
                <ChevronDown size={16} strokeWidth={2.5} /> Xem thêm {hiddenCount} chi tiết món
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 shrink-0 pt-2 relative z-20">
          <button
            type="button"
            onClick={handleAction}
            disabled={isUpdating}
            className={`group flex h-[3.5rem] w-full items-center justify-center rounded-[20px] px-6 text-[0.95rem] font-black transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-0 ${
              isPreparingAction
                ? "bg-[#FCFBF8] text-gray-900 ring-1 ring-inset ring-[#EDE5D8] hover:bg-white hover:shadow-md hover:ring-[#F0D8B7]"
                : "bg-gradient-to-r from-[#C85712] to-[#A3581E] text-white shadow-[0_8px_16px_-6px_rgba(200,87,18,0.4)] hover:brightness-110"
            }`}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2.5">
                <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
                Đang cập nhật
              </span>
            ) : (
              resolveActionLabel(order.status)
            )}
          </button>
        </div>
      </article>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 py-3 backdrop-blur-sm transition-opacity sm:items-center sm:px-4 sm:py-6">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200 sm:max-h-[85vh] sm:rounded-[32px]">
            <div className="shrink-0 border-b border-[#EDE5D8] bg-gradient-to-r from-[#FCFBF8] to-white px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.5rem] font-black tracking-tight text-gray-900 sm:text-[1.8rem]">Chi tiết sản phẩm</h3>
                  <p className="mt-1 text-[0.95rem] font-medium text-gray-500">
                    Mã đơn <span className="font-black text-[#C85712]">{order.code}</span> • {order.order_items.length} phần
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <X size={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#FDFCF9] p-5 sm:p-8">
              {order.order_items.map((item) => (
                <div
                  key={`modal-${item.order_item_id}`}
                  className="rounded-[24px] bg-white p-5 ring-1 ring-inset ring-[#EDE5D8] shadow-sm transition-colors hover:shadow-md"
                >
                  <div className="flex items-start gap-5">
                    {item.product_image_url ? (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[20px] shadow-sm ring-1 ring-inset ring-black/5">
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-gray-50 to-gray-100 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ring-1 ring-inset ring-gray-200/50">
                        No Img
                      </div>
                    )}

                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-start gap-4">
                        <div className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-[14px] bg-orange-50 text-[1.1rem] font-black text-[#C85712] ring-1 ring-[#C85712]/20">
                          {item.quantity}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[1.25rem] font-black leading-tight tracking-tight text-gray-900">
                            {item.product_name}
                          </p>

                          {item.options.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2.5">
                              {item.options.map((option) => (
                                <span
                                  key={`modal-${item.order_item_id}-${option.product_franchise_id}-${option.product_name}`}
                                  className="rounded-[12px] bg-[#FCFBF8] px-3 py-1.5 text-[0.75rem] font-black uppercase tracking-[0.1em] text-gray-600 ring-1 ring-inset ring-[#EDE5D8]"
                                >
                                  {option.product_name} <span className="text-[#C85712]">x{option.quantity}</span>
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

            <div className="shrink-0 border-t border-[#EDE5D8] bg-white px-5 py-5 sm:flex sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-14 w-full items-center justify-center rounded-[20px] bg-gray-100 px-6 text-[0.95rem] font-black text-gray-700 transition hover:bg-gray-200 sm:w-auto sm:min-w-[140px]"
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
