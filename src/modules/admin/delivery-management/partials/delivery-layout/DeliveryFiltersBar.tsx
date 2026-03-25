import { ChevronDown, ListFilter, Truck } from "lucide-react";
import { DELIVERY_STATUS_OPTIONS } from "../../config/delivery-status.config";
import type { DeliveryStatus } from "../../models/delivery-management.models";

interface DeliveryFiltersBarProps {
  franchiseName: string;
  totalItems: number;
  status: DeliveryStatus | "";
  isLoading: boolean;
  onStatusChange: (value: DeliveryStatus | "") => void;
}

export const DeliveryFiltersBar = ({
  franchiseName,
  totalItems,
  status,
  isLoading,
  onStatusChange,
}: DeliveryFiltersBarProps) => {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#A3581E]">
          <Truck size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#A3581E]">
            Ship Orders
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
            Deliveries
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {franchiseName || "Đang chờ chi nhánh làm việc"} • {totalItems} delivery
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50/80 p-3 ring-1 ring-black/5">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
          <ListFilter size={14} />
          <span>Lọc theo trạng thái</span>
        </div>

        <div className="relative">
          <select
            value={status}
            disabled={isLoading}
            onChange={(event) => onStatusChange(event.target.value as DeliveryStatus | "")}
            className="w-full appearance-none rounded-2xl border-none bg-white py-3.5 pl-4 pr-11 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200 outline-none transition focus:ring-4 focus:ring-orange-700/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {DELIVERY_STATUS_OPTIONS.map((option) => (
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
  );
};

export default DeliveryFiltersBar;
