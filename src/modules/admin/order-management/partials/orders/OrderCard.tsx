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
      className={`relative w-full overflow-hidden text-left transition-all ${
        isSelected
          ? "border-amber-400 bg-amber-50/50 shadow-md ring-1 ring-amber-400"
          : "border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:bg-gray-50"
      } rounded-2xl border p-4`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900">{order.code}</p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(order.created_at).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            - {new Date(order.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${ORDER_STATUS_BADGES[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="text-sm text-gray-600 truncate max-w-[60%]">
          📞 {order.phone || "Khách vãng lai"}
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-amber-800">
            {currency.format(order.final_amount)}đ
          </p>
        </div>
      </div>
    </button>
  );
};

export default OrderCard;
