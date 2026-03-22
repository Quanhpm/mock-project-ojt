import type { OrderDetail } from "../../models/order.models";
import {
  ORDER_PROGRESS_FLOW,
  ORDER_STATUS_LABELS,
} from "../../config/order-status.config";

interface OrderHistoryTimelineProps {
  order: OrderDetail;
}

export const OrderHistoryTimeline = ({ order }: OrderHistoryTimelineProps) => {
  if (order.status === "CANCELED") {
    return (
      <div className="rounded-[24px] border border-rose-100 bg-rose-50/70 p-5">
        <p className="text-sm font-black text-rose-700">{ORDER_STATUS_LABELS.CANCELED}</p>
        <p className="mt-1 text-xs font-semibold text-rose-500">
          Đơn hàng đã kết thúc ở trạng thái hủy.
        </p>
      </div>
    );
  }

  const currentStepIndex = ORDER_PROGRESS_FLOW.indexOf(order.status);
  const steps = ORDER_PROGRESS_FLOW.map((status, index) => ({
    status,
    title: ORDER_STATUS_LABELS[status],
    isActive: currentStepIndex >= index,
    isCurrent: order.status === status,
  }));

  return (
    <div className="relative space-y-8 pl-4 pt-2">
      {/* Timeline Line */}
      <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gray-100" />

      {steps.map((step, index) => (
        <div key={index} className="relative flex items-start gap-4">
          {/* Dot */}
          <div 
            className={`relative z-10 mt-1.5 h-4 w-4 rounded-full ring-4 ring-white ${
              step.isActive ? "bg-[#A3581E]" : "bg-gray-200"
            }`} 
          />
          
          <div className="space-y-1">
            <p className={`text-sm font-black ${step.isActive ? "text-gray-900" : "text-gray-400"}`}>
              {step.title}
            </p>
            <p className="text-[11px] font-bold text-gray-400">
              {step.isCurrent
                ? "Trạng thái hiện tại"
                : step.isActive
                  ? "Đã hoàn thành"
                  : "Chưa bắt đầu"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
