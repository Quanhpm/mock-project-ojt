import { RotateCcw } from "lucide-react";
import { PAYMENT_HISTORY_STATUS_OPTIONS } from "../../config/payment-history.config";
import type { PaymentHistoryStatus } from "../../models/payment-history.models";

interface PaymentHistoryFiltersProps {
  statusFilter: PaymentHistoryStatus | "";
  dateFrom: string;
  dateTo: string;
  isLoading: boolean;
  onStatusChange: (status: PaymentHistoryStatus | "") => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onResetFilters: () => void;
}

export const PaymentHistoryFilters = ({
  statusFilter,
  dateFrom,
  dateTo,
  isLoading,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onResetFilters,
}: PaymentHistoryFiltersProps) => {
  const isResetDisabled = !statusFilter && !dateFrom && !dateTo;

  return (
    <div className="rounded-[28px] bg-gray-50/80 p-4 ring-1 ring-black/5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
          Trạng thái
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as PaymentHistoryStatus | "")
            }
            disabled={isLoading}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {PAYMENT_HISTORY_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
          Từ ngày
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            disabled={isLoading}
            onChange={(event) => onDateFromChange(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
          Đến ngày
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            disabled={isLoading}
            onChange={(event) => onDateToChange(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onResetFilters}
            disabled={isResetDisabled || isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryFilters;
