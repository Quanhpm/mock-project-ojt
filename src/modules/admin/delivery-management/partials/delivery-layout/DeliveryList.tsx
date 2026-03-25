import { SearchX } from "lucide-react";
import type { DeliverySearchItem } from "../../models/delivery-management.models";
import { DeliveryCard } from "./DeliveryCard";

interface DeliveryListProps {
  deliveries: DeliverySearchItem[];
  isLoading: boolean;
  selectedDeliveryId?: string;
  onSelectDelivery: (deliveryId: string) => void;
}

export const DeliveryList = ({
  deliveries,
  isLoading,
  selectedDeliveryId,
  onSelectDelivery,
}: DeliveryListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[24px] border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
        <SearchX size={34} className="text-gray-400" />
        <p className="mt-4 text-lg font-black tracking-tight text-gray-900">
          Chưa có delivery phù hợp
        </p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
          Đổi bộ lọc trạng thái hoặc kiểm tra lại franchise context để tải danh sách giao hàng.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {deliveries.map((delivery) => (
        <DeliveryCard
          key={delivery._id}
          delivery={delivery}
          isSelected={selectedDeliveryId === delivery._id}
          onClick={() => onSelectDelivery(delivery._id)}
        />
      ))}
    </div>
  );
};

export default DeliveryList;
