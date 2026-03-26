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
    <div className="rounded-[32px] border border-[#EDE5D8] bg-white px-4 py-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:px-6 md:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-[0.75rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">
            <span className="h-2 w-2 rounded-full bg-[#C85712] animate-pulse" />
            Staff Order Queue
          </p>
          <h1 className="mt-3 text-[2.5rem] font-black leading-none tracking-tight text-gray-900">
            Hàng đợi làm món
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-gray-500">
            Theo dõi các order vừa thanh toán và đang chuẩn bị, ưu tiên hiển thị đơn mới nhất lên trước để staff xử lý nhanh.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-center rounded-[24px] bg-[#FCFBF8] px-6 py-4 ring-1 ring-inset ring-[#EDE5D8]">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">Chi nhánh</p>
            <p className="mt-1.5 text-[0.95rem] font-black text-gray-900">{franchiseName || "Theo franchise hiện tại"}</p>
          </div>

          <div className="flex flex-col justify-center rounded-[24px] bg-gradient-to-br from-orange-50 to-orange-100 px-6 py-4 ring-1 ring-inset ring-[#C85712]/10 shadow-inner">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">Đơn đang chờ</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-[#C85712]">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[24px] bg-gradient-to-r from-[#FCFBF8] to-[#FDFCF9] p-4 ring-1 ring-inset ring-[#EDE5D8]">
        <p className="px-3 text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#A3581E]">Lọc theo trạng thái</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {SORT_OPTIONS.map((option) => {
            const isActive = sortMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSortChange(option.value)}
                className={`flex w-full items-center justify-between gap-2.5 rounded-[16px] px-4 py-3 text-[0.9rem] font-black uppercase tracking-[0.05em] transition-all active:scale-95 sm:w-auto sm:px-5 ${
                  isActive
                    ? "bg-gradient-to-r from-[#C85712] to-[#A3581E] text-white shadow-[0_4px_12px_-4px_rgba(200,87,18,0.4)]"
                    : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-[#FDFCF9] hover:text-[#C85712] hover:ring-[#F0D8B7]"
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`flex h-5 items-center justify-center rounded-lg px-2 text-[0.7rem] font-black shadow-inner ${
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
