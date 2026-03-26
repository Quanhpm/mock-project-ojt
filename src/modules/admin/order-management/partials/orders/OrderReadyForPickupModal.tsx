import { Check, Loader2, Truck, X } from "lucide-react";
import type { DeliveryAssigneeOption } from "../../models/delivery-assignee.models";

interface OrderReadyForPickupModalProps {
  open: boolean;
  staffOptions: DeliveryAssigneeOption[];
  selectedStaffId: string | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSelectStaff: (staffId: string) => void;
  onConfirm: () => void;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "NV";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export const OrderReadyForPickupModal = ({
  open,
  staffOptions,
  selectedStaffId,
  isLoading = false,
  isSubmitting = false,
  onClose,
  onSelectStaff,
  onConfirm,
}: OrderReadyForPickupModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-[28px]">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
        >
          <X size={20} />
        </button>

        <div className="shrink-0 border-b border-gray-100 px-5 pb-5 pt-6 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Truck size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
                CHỌN STAFF GIAO HÀNG
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                Sẵn sàng bàn giao đơn hàng
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Chọn staff phụ trách giao hàng trước khi chuyển đơn sang trạng thái sẵn sàng bàn giao.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {isLoading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm font-medium">Đang tải danh sách staff giao hàng...</p>
            </div>
          ) : staffOptions.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
              <p className="text-base font-bold text-gray-900">Chưa có staff phù hợp trong chi nhánh</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                Hệ thống chưa lấy được danh sách user giao hàng cho chi nhánh này. Vui lòng kiểm tra phân quyền user-franchise-role rồi thử lại.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffOptions.map((staff) => {
                const isSelected = selectedStaffId === staff.value;

                return (
                  <button
                    key={staff.value}
                    type="button"
                    onClick={() => onSelectStaff(staff.value)}
                    className={`flex w-full items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-amber-300 bg-amber-50/70 ring-2 ring-amber-600/10"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {staff.image ? (
                      <img
                        src={staff.image}
                        alt={staff.name}
                        className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-black/5"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fae8d9] text-sm font-black text-[#b35e22]">
                        {getInitials(staff.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="truncate text-base font-black text-gray-900">{staff.name}</p>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                            <Check size={12} />
                            Đã chọn
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-500">{staff.email || "Chưa có email"}</p>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {staff.phone || "Chưa có số điện thoại"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-5 py-5 sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 w-full rounded-2xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 sm:w-auto"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading || isSubmitting || !selectedStaffId || staffOptions.length === 0}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#A3581E] px-5 text-sm font-black text-white shadow-lg shadow-orange-900/10 transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none sm:w-auto sm:min-w-[200px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Đang cập nhật
                </span>
              ) : (
                "Xác nhận bàn giao"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReadyForPickupModal;
