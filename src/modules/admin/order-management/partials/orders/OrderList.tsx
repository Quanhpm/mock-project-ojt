import { OrderCard } from "./OrderCard";
import type { FranchiseOrderListItem } from "../../models/order.models";

interface OrderListProps {
  orders: FranchiseOrderListItem[];
  isLoading: boolean;
  selectedOrderId?: string;
  onSelectOrder: (orderId: string) => void;
}

export const OrderList = ({
  orders,
  isLoading,
  selectedOrderId,
  onSelectOrder,
}: OrderListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
        <p>Không có đơn hàng nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {[...orders].reverse().map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          isSelected={selectedOrderId === order._id}
          onClick={() => onSelectOrder(order._id)}
        />
      ))}
    </div>
  );
};

export default OrderList;
