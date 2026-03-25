import { CalendarDays, MapPin } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  getDeliveryStatusBadgeClass,
  getDeliveryStatusLabel,
} from "../../config/delivery-status.config";
import type { DeliverySearchItem } from "../../models/delivery-management.models";

interface DeliveryCardProps {
  delivery: DeliverySearchItem;
  isSelected?: boolean;
  onClick: () => void;
}

const formatCardDate = (value?: string | null) => {
  if (!value) {
    return "Chưa có thời gian";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "Chưa có thời gian";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
};

export const DeliveryCard = ({ delivery, isSelected, onClick }: DeliveryCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-[24px] border border-transparent p-5 text-left transition-all active:scale-[0.98]",
        isSelected
          ? "bg-orange-50/70 shadow-md ring-2 ring-[#A3581E]/15"
          : "bg-white shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-black tracking-tight text-gray-900">
              {delivery.order_code || "ORDER"}
            </p>
            {isSelected ? (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#A3581E]" />
            ) : null}
          </div>

          <p className="mt-1 truncate text-sm font-semibold text-gray-700">
            {delivery.customer_name || "Khách hàng chưa xác định"}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ring-1",
            getDeliveryStatusBadgeClass(delivery.status),
          )}
        >
          {getDeliveryStatusLabel(delivery.status)}
        </span>
      </div>

      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-500">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0 text-[#A3581E]" />
          <span className="line-clamp-2">{delivery.order_address || "Chưa có địa chỉ giao hàng"}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <CalendarDays size={14} className="text-gray-400" />
          <span>{formatCardDate(delivery.assigned_at || delivery.created_at)}</span>
        </div>
      </div>

      {isSelected ? <div className="absolute left-0 top-0 h-full w-1 bg-[#A3581E]" /> : null}
    </button>
  );
};

export default DeliveryCard;
