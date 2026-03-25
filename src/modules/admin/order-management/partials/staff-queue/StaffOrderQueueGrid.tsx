import type { StaffQueueOrder } from "../../models/order.models";
import { StaffOrderQueueCard } from "./StaffOrderQueueCard";

interface StaffOrderQueueGridProps {
  orders: StaffQueueOrder[];
  isLoading: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  updatingOrderId?: string | null;
  loadMoreTriggerIndex?: number;
  onLoadMoreTriggerRef?: (node: HTMLDivElement | null) => void;
  onMarkPreparing: (order: StaffQueueOrder) => void;
  onMarkReadyForPickup: (order: StaffQueueOrder) => void;
}

export const StaffOrderQueueGrid = ({
  orders,
  isLoading,
  emptyStateTitle,
  emptyStateDescription,
  updatingOrderId,
  loadMoreTriggerIndex,
  onLoadMoreTriggerRef,
  onMarkPreparing,
  onMarkReadyForPickup,
}: StaffOrderQueueGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="min-h-[560px] animate-pulse rounded-[32px] border border-gray-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-300 bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-2xl font-black tracking-tight text-gray-900">
          {emptyStateTitle || "Queue hiện đang trống"}
        </p>
        <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
          {emptyStateDescription ||
            "Chưa có order nào ở trạng thái chờ làm món hoặc đang chuẩn bị trong chi nhánh hiện tại."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
      {orders.map((order, index) => (
        <div
          key={order._id}
          ref={index === loadMoreTriggerIndex ? onLoadMoreTriggerRef : undefined}
        >
          <StaffOrderQueueCard
            order={order}
            isUpdating={updatingOrderId === order._id}
            onMarkPreparing={onMarkPreparing}
            onMarkReadyForPickup={onMarkReadyForPickup}
          />
        </div>
      ))}
    </div>
  );
};

export default StaffOrderQueueGrid;
