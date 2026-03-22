import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS } from "../../config/order-status.config";
import type { FranchiseOrderListItem } from "../../models/order.models";

const currency = new Intl.NumberFormat("vi-VN");

interface OrderCardProps {
  order: FranchiseOrderListItem;
  isSelected?: boolean;
  onClick: () => void;
}

export const OrderCard = ({ order, isSelected, onClick }: OrderCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden text-left transition-all active:scale-[0.98] ${
        isSelected
          ? "bg-amber-50/50 shadow-md ring-2 ring-amber-600/20"
          : "bg-white shadow-sm hover:bg-gray-50/80 hover:shadow-md hover:ring-1 hover:ring-black/5"
      } rounded-[24px] p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-black tracking-tight text-gray-900">{order.code}</p>
            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />}
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {new Date(order.created_at).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            • {new Date(order.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5 ${ORDER_STATUS_BADGES[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-600">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <span className="text-[10px]">👤</span>
          </div>
          <span className="truncate">{order.phone || "Khách vãng lai"}</span>
        </div>
        <div className="text-right">
          <p className="text-base font-black text-amber-800">
            {currency.format(order.final_amount)}<span className="ml-0.5 text-xs">đ</span>
          </p>
        </div>
      </div>

      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-1 bg-amber-600" />
      )}
    </button>
  );
};

export default OrderCard;
