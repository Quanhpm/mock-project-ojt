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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Top row: Search and Refresh */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none ring-0 transition focus:border-amber-700"
              placeholder="Tìm theo mã đơn hoặc số điện thoại"
              type="text"
            />
          </div>

          <button
            onClick={onRefresh}
            className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Làm mới
          </button>
        </div>

        {/* Bottom row: Status Tabs */}
        <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-gray-200 pb-2 scrollbar-hide">
          {ORDER_STATUS_OPTIONS.map((option) => {
            const isActive = status === option.value;
            return (
              <button
                key={option.label}
                onClick={() => onStatusChange(option.value as OrderStatus | "")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-amber-100 text-amber-800"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderFiltersBar;
