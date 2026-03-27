import type { StaffQueueOrder } from "../../models/order.models";
import { StaffOrderQueueListItem } from "./StaffOrderQueueListItem";

interface StaffOrderQueueListProps {
  orders: StaffQueueOrder[];
  isLoading: boolean;
  selectedOrderId?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  loadMoreTriggerIndex?: number;
  onLoadMoreTriggerRef?: (node: HTMLDivElement | null) => void;
  onSelectOrder: (orderId: string) => void;
}

export const StaffOrderQueueList = ({
  orders,
  isLoading,
  selectedOrderId,
  emptyStateTitle,
  emptyStateDescription,
  loadMoreTriggerIndex,
  onLoadMoreTriggerRef,
  onSelectOrder,
}: StaffOrderQueueListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-[132px] animate-pulse rounded-[24px] border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
          <p className="text-2xl">☕</p>
        </div>
        <p className="text-xl font-bold text-gray-900">
          {emptyStateTitle || "Queue hiện đang trống"}
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          {emptyStateDescription ||
            "Chưa có order nào ở trạng thái chờ làm món hoặc đang chuẩn bị trong chi nhánh hiện tại."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order, index) => (
        <div
          key={order._id}
          ref={index === loadMoreTriggerIndex ? onLoadMoreTriggerRef : undefined}
        >
          <StaffOrderQueueListItem
            order={order}
            isSelected={selectedOrderId === order._id}
            onClick={() => onSelectOrder(order._id)}
          />
        </div>
      ))}
    </div>
  );
};

export default StaffOrderQueueList;
