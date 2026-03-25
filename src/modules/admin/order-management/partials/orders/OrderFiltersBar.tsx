import { ChevronDown, ListFilter, Search } from "lucide-react";
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            className="flex h-[46px] shrink-0 items-center justify-center rounded-2xl bg-amber-700 px-6 text-sm font-bold text-white shadow-lg shadow-amber-700/20 transition hover:bg-amber-800 active:scale-95"
          >
            Làm mới
          </button>
        </div>

        <div className="rounded-2xl bg-gray-50/80 p-3 ring-1 ring-black/5">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
            <ListFilter size={14} />
            <span>Lọc theo trạng thái</span>
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value as OrderStatus | "")}
              className="w-full appearance-none rounded-2xl border-none bg-white py-3.5 pl-4 pr-11 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200 outline-none transition focus:ring-4 focus:ring-amber-700/10"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFiltersBar;
