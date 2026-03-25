import {
  ArrowRightLeft,
  CalendarDays,
  Check,
  Mail,
  MapPin,
  Package2,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  canCompleteDelivery,
  canPickupDelivery,
  getDeliveryStatusBadgeClass,
  getDeliveryStatusLabel,
  isDeliveredDelivery,
} from "../../config/delivery-status.config";
import type { DeliverySearchItem } from "../../models/delivery-management.models";
import type { OrderDetail, OrderItem } from "@/modules/admin/order-management/models/order.models";

interface DeliveryDetailPanelProps {
  delivery: DeliverySearchItem;
  orderDetail: OrderDetail | null;
  isLoadingOrderDetail: boolean;
  didFailOrderDetail: boolean;
  isUpdatingPickup: boolean;
  isUpdatingComplete: boolean;
  onPickup: () => void;
  onComplete: () => void;
}

const formatHeaderDate = (value?: string | null) => {
  if (!value) {
    return "Chưa có thời gian";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "Chưa có thời gian";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(timestamp);
};

const formatTimelineDate = (value?: string | null) => {
  if (!value) {
    return "Đang chờ cập nhật";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "Đang chờ cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
};

const hasCompletedTimestamp = (value?: string | null) => Boolean(value?.trim());

const getDriverInitials = (name?: string | null) => {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return "DV";
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const getItemSubtitle = (item: OrderItem) => {
  if (!item.options?.length) {
    return "Không có topping";
  }

  return item.options
    .map((option) => `${option.quantity > 1 ? `${option.quantity}x ` : ""}${option.product_name}`)
    .join(" • ");
};

const DeliveryTimeline = ({ delivery }: { delivery: DeliverySearchItem }) => {
  const isDelivered =
    isDeliveredDelivery(delivery.status) || hasCompletedTimestamp(delivery.delivered_at);
  const isPickedUp =
    canCompleteDelivery(delivery.status) ||
    isDelivered ||
    hasCompletedTimestamp(delivery.picked_up_at);
  const timelineItems = [
    {
      key: "delivered",
      title: "Delivered",
      description: "Package arrived at destination",
      date: delivery.delivered_at,
      completed: isDelivered,
    },
    {
      key: "picked_up",
      title: "Picked up",
      description: "Courier collected the parcel",
      date: delivery.picked_up_at,
      completed: isPickedUp,
    },
    {
      key: "assigned",
      title: "Assigned",
      description: "Order assigned to logistics",
      date: delivery.assigned_at || delivery.created_at,
      completed: true,
    },
  ];

  return (
    <div className="rounded-[32px] border border-[#EDE5D8] bg-white p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-50 to-orange-100 text-[#C85712] shadow-inner">
          <CalendarDays strokeWidth={2.5} size={22} />
        </span>
        <div>
          <p className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
            Delivery Timeline
          </p>
          <p className="mt-0.5 text-[0.9rem] text-gray-500">Tiến độ giao hàng</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {timelineItems.map((item, index) => (
          <div key={item.key} className="relative flex gap-5">
            {index < timelineItems.length - 1 ? (
              <div className="absolute left-[19px] top-10 h-[calc(100%-8px)] w-[2px] rounded-full bg-gradient-to-b from-[#EDE5D8] to-transparent" />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white shadow-sm transition-transform hover:scale-110",
                item.completed ? "bg-gradient-to-br from-[#C85712] to-[#A3581E] text-white" : "bg-gray-50 border border-[#EDE5D8] text-gray-300",
              )}
            >
              {item.completed ? <Check strokeWidth={3} size={18} /> : <span className="h-2.5 w-2.5 rounded-full bg-[#EDE5D8]" />}
            </span>

            <div className="min-w-0 pb-3">
              <p className={cn("text-[1.35rem] font-black tracking-tight transition-colors", item.completed ? "text-gray-900" : "text-gray-500")}>{item.title}</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-gray-500">{item.description}</p>
              <p className={cn("mt-3 inline-flex items-center rounded-lg px-2.5 py-1 text-[0.7rem] font-black uppercase tracking-[0.1em] shadow-sm", item.completed ? "bg-orange-50 text-[#C85712] ring-1 ring-[#C85712]/10" : "bg-gray-50 text-gray-400 ring-1 ring-gray-200")}>
                {formatTimelineDate(item.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeliveryItemsSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-3xl border border-gray-100 px-5 py-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-gray-100" />
          <div className="flex-1 space-y-3">
            <div className="h-4 rounded-full bg-gray-100" />
            <div className="h-3 w-2/3 rounded-full bg-gray-100" />
          </div>
          <div className="h-6 w-10 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
};

export const DeliveryDetailPanel = ({
  delivery,
  orderDetail,
  isLoadingOrderDetail,
  didFailOrderDetail,
  isUpdatingPickup,
  isUpdatingComplete,
  onPickup,
  onComplete,
}: DeliveryDetailPanelProps) => {
  const isPickupAvailable = canPickupDelivery(delivery.status);
  const isCompleteAvailable =
    canCompleteDelivery(delivery.status) ||
    (hasCompletedTimestamp(delivery.picked_up_at) && !hasCompletedTimestamp(delivery.delivered_at));
  const isActionAvailable = isPickupAvailable || isCompleteAvailable;
  const isUpdatingStatus = isUpdatingPickup || isUpdatingComplete;
  const actionLabel = isPickupAvailable
    ? "Đổi sang Pickup"
    : isCompleteAvailable
      ? "Đã giao hàng"
      : "Đã giao hàng";
  const handleAction = isPickupAvailable ? onPickup : onComplete;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.15em] shadow-sm ring-1 ring-inset",
                  getDeliveryStatusBadgeClass(delivery.status),
                )}
              >
                {getDeliveryStatusLabel(delivery.status)}
              </span>
            </div>
            
            <h1 className="text-[2.5rem] font-black leading-none tracking-tight text-gray-900">
              {delivery.order_code || "ORDER"}
            </h1>

            <div className="flex items-center gap-2.5 text-[0.95rem] font-medium text-gray-500">
              <CalendarDays size={18} strokeWidth={2.5} className="text-[#A3581E]/60" />
              <span>{formatHeaderDate(delivery.assigned_at || delivery.created_at)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!isActionAvailable || isUpdatingStatus}
            onClick={handleAction}
            className={cn(
              "group relative inline-flex h-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] px-7 text-[0.95rem] font-black shadow-sm ring-1 ring-inset transition-all active:scale-[0.98]",
              isActionAvailable
                ? "bg-white text-gray-900 ring-[#EDE5D8] hover:bg-[#FCFBF8] hover:shadow-md hover:ring-[#F0D8B7]"
                : "cursor-not-allowed bg-gray-50 text-gray-400 ring-gray-200",
            )}
          >
            {isActionAvailable && (
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-orange-50/50 to-orange-50/0 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
            <div className="relative flex items-center gap-3">
              <ArrowRightLeft strokeWidth={2.5} size={18} className={cn("transition-colors", isActionAvailable ? "text-[#C85712]" : "text-gray-400")} />
              <span>{isUpdatingStatus ? "Đang cập nhật..." : actionLabel}</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-[#EDE5D8] bg-white p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-50 to-orange-100 text-[#C85712] shadow-inner">
                  <User strokeWidth={2.5} size={22} />
                </span>
                <div>
                  <p className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                    Customer Information
                  </p>
                  <p className="mt-0.5 text-[0.9rem] text-gray-500">Thông tin giao hàng của khách</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col justify-center rounded-[24px] bg-[#FCFBF8] p-5 ring-1 ring-inset ring-[#EDE5D8] transition-all hover:bg-white hover:shadow-sm">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                    Full Name
                  </p>
                  <p className="mt-2.5 text-2xl font-black tracking-tight text-gray-900">
                    {delivery.customer_name || orderDetail?.customer_name || "Khách hàng"}
                  </p>
                </div>

                <div className="flex flex-col justify-center rounded-[24px] bg-[#FCFBF8] p-5 ring-1 ring-inset ring-[#EDE5D8] transition-all hover:bg-white hover:shadow-sm">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                    Phone Number
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xl font-black tracking-tight text-gray-900">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#C85712]">
                      <Phone size={16} strokeWidth={2.5} />
                    </span>
                    <span>{delivery.order_phone || delivery.customer_phone || "Chưa có số điện thoại"}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-[24px] bg-[#FCFBF8] p-5 ring-1 ring-inset ring-[#EDE5D8] transition-all hover:bg-white hover:shadow-sm">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                    Email Address
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[1.05rem] font-bold text-gray-800">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#C85712]">
                      <Mail size={16} strokeWidth={2.5} />
                    </span>
                    <span className="truncate">{delivery.customer_email || "Chưa có email"}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-[24px] bg-[#FCFBF8] p-5 ring-1 ring-inset ring-[#EDE5D8] transition-all hover:bg-white hover:shadow-sm">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                    Delivery Address
                  </p>
                  <div className="mt-2 flex items-start gap-3 text-[1.05rem] font-bold leading-relaxed text-gray-800">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#C85712]">
                      <MapPin size={16} strokeWidth={2.5} />
                    </span>
                    <span className="line-clamp-2">{delivery.order_address || orderDetail?.address || "Chưa có địa chỉ giao hàng"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] bg-gradient-to-br from-[#FDFBF7] to-[#FCFBF8] p-6 ring-1 ring-inset ring-[#F0D8B7]/60">
                <div className="flex items-center gap-3">
                  <StickyNote size={18} strokeWidth={2.5} className="text-[#A3581E]" />
                  <p className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                    Customer Note
                  </p>
                </div>
                <p className="mt-3 text-[1.15rem] font-medium italic leading-relaxed text-gray-700">
                  "{delivery.order_message || orderDetail?.message || "Không có ghi chú từ khách hàng"}"
                </p>
              </div>
            </section>

            <section className="rounded-[32px] border border-[#EDE5D8] bg-white p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-50 to-orange-100 text-[#C85712] shadow-inner">
                  <Package2 strokeWidth={2.5} size={22} />
                </span>
                <div>
                  <p className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                    Shipment Contents
                  </p>
                  <p className="mt-0.5 text-[0.9rem] text-gray-500">Các sản phẩm nằm trong đơn hàng này</p>
                </div>
              </div>

              <div className="mt-8">
                {isLoadingOrderDetail ? (
                  <DeliveryItemsSkeleton />
                ) : didFailOrderDetail ? (
                  <div className="rounded-[24px] border border-dashed border-[#EDE5D8] bg-[#FDFCF9] px-6 py-12 text-center text-sm leading-relaxed text-gray-500 shadow-sm">
                    Không tải được danh sách sản phẩm của đơn hàng này.
                  </div>
                ) : orderDetail?.order_items?.length ? (
                  <div className="space-y-4">
                    {orderDetail.order_items.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="group flex items-center gap-5 rounded-[24px] bg-[#FCFBF8] p-4 ring-1 ring-inset ring-[#EDE5D8] transition-all hover:bg-white hover:shadow-md hover:ring-[#F0D8B7]"
                      >
                        {item.product_image_url ? (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[20px] shadow-sm">
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[20px]" />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 shadow-inner ring-1 ring-inset ring-gray-200/50">
                            <Package2 strokeWidth={1.5} size={28} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1 py-1">
                          <p className="truncate text-[1.4rem] font-black tracking-tight text-gray-900 group-hover:text-[#C85712] transition-colors">
                            {item.product_name}
                          </p>
                          <p className="mt-1 truncate text-[0.95rem] text-gray-500">
                            {getItemSubtitle(item)}
                          </p>
                        </div>

                        <div className="flex items-center justify-center rounded-xl bg-orange-50 px-4 py-2 text-2xl font-black text-[#C85712] shadow-sm ring-1 ring-[#F0D8B7]/50">
                          x{item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[#EDE5D8] bg-[#FDFCF9] px-6 py-12 text-center text-[0.95rem] leading-relaxed text-gray-500 shadow-sm">
                    Đơn hàng này chưa có sản phẩm để hiển thị.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <DeliveryTimeline delivery={delivery} />

            <section className="relative overflow-hidden rounded-[32px] border border-[#F0D8B7] bg-gradient-to-br from-[#FFF8EE] to-[#FDFCF9] p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 text-[0.8rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
                  <span className="h-2 w-2 rounded-full bg-[#C85712] animate-pulse" />
                  Driver Profile
                </p>

                <div className="mt-6 flex items-center gap-5">
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#12343B] to-[#1a4a54] text-[1.4rem] font-black tracking-wide text-white shadow-md ring-4 ring-white">
                    {getDriverInitials(delivery.assigned_to_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1.5rem] font-black tracking-tight text-gray-900">
                      {delivery.assigned_to_name || "Chưa có nhân sự giao hàng"}
                    </p>
                    <p className="mt-0.5 truncate text-[0.95rem] font-medium text-gray-500">
                      {delivery.assigned_to_email || "Đang chờ cập nhật email"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-100/50 blur-3xl" />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailPanel;
