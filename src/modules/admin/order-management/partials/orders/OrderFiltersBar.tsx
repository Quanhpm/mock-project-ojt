import { Search } from "lucide-react";
import { ORDER_STATUS_OPTIONS } from "../../config/order-status.config";
import type { OrderStatus } from "../../models/order.models";

interface OrderFiltersBarProps {
  status: OrderStatus | "";
  searchQuery: string;
  onStatusChange: (value: OrderStatus | "") => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export const OrderFiltersBar = ({
  status,
  searchQuery,
  onStatusChange,
  onSearchChange,
  onRefresh,
}: OrderFiltersBarProps) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Top row: Search and Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full rounded-2xl border-none bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-amber-700/20"
              placeholder="Tìm theo mã đơn hoặc SĐT..."
              type="text"
            />
          </div>

          <button
            onClick={onRefresh}
            className="flex h-[46px] items-center justify-center rounded-2xl bg-amber-700 px-6 text-sm font-bold text-white shadow-lg shadow-amber-700/20 transition hover:bg-amber-800 active:scale-95"
          >
            Làm mới
          </button>
        </div>

        {/* Bottom row: Status Tabs */}
        <div className="hide-scroll flex w-full items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ORDER_STATUS_OPTIONS.map((option) => {
            const isActive = status === option.value;
            const label = option.value === "" ? "Tất cả" : option.label;
            return (
              <button
                key={option.label}
                onClick={() => onStatusChange(option.value as OrderStatus | "")}
                className={`flex shrink-0 items-center whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                  isActive
                    ? "bg-amber-700 text-white shadow-md shadow-amber-700/25 ring-1 ring-amber-700"
                    : "bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderFiltersBar;
