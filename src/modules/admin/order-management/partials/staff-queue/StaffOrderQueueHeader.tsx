import type { StaffQueueSortMode } from "../../models/order.models";

interface StaffOrderQueueHeaderProps {
  franchiseName?: string;
  totalOrders: number;
  confirmedCount: number;
  readyToPickupCount: number;
  sortMode: StaffQueueSortMode;
  onSortChange: (mode: StaffQueueSortMode) => void;
}

const SORT_OPTIONS: Array<{
  value: StaffQueueSortMode;
  label: string;
  countKey: "totalOrders" | "confirmedCount" | "readyToPickupCount";
}> = [
  { value: "ALL", label: "Tất cả", countKey: "totalOrders" },
  { value: "CONFIRMED", label: "Confirmed", countKey: "confirmedCount" },
  { value: "READY_TO_PICKUP", label: "Ready to pickup", countKey: "readyToPickupCount" },
];

export const StaffOrderQueueHeader = ({
  franchiseName,
  totalOrders,
  confirmedCount,
  readyToPickupCount,
  sortMode,
  onSortChange,
}: StaffOrderQueueHeaderProps) => {
  const counts = {
    totalOrders,
    confirmedCount,
    readyToPickupCount,
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
            <span className="inline-flex h-5 items-center rounded-full bg-amber-50 px-2 text-[10px] font-black text-amber-700 ring-1 ring-amber-700/10">
              LIVE
            </span>
            Staff Order Queue
          </p>
          <h1 className="mt-3 text-3xl font-black leading-none tracking-tight text-gray-900">
            Hàng đợi làm món
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Theo dõi các order vừa thanh toán và đang chuẩn bị, ưu tiên hiển thị đơn mới nhất lên trước để staff xử lý nhanh.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col justify-center rounded-2xl bg-gray-50 px-5 py-3.5 ring-1 ring-black/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Chi nhánh</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{franchiseName || "Theo franchise hiện tại"}</p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-amber-50/60 px-5 py-3.5 ring-1 ring-amber-700/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Đơn đang chờ</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-amber-800">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gray-50/80 p-3 ring-1 ring-black/5">
        <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
          <span>Lọc theo trạng thái</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => {
            const isActive = sortMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSortChange(option.value)}
                className={`flex w-full items-center justify-between gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all active:scale-95 sm:w-auto sm:px-5 ${
                  isActive
                    ? "bg-amber-700 text-white shadow-lg shadow-amber-700/20"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-amber-800 hover:ring-amber-600/20"
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`flex h-5 items-center justify-center rounded-lg px-2 text-xs font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {counts[option.countKey]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StaffOrderQueueHeader;
