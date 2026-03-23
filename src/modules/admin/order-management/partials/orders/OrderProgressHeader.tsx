import { Check, Loader2 } from "lucide-react";
import type { OrderDetail, OrderStatus, PaymentStatus } from "../../models/order.models";

interface OrderProgressHeaderProps {
  order: OrderDetail;
  paymentStatus?: PaymentStatus | null;
  isUpdatingStatus?: boolean;
  onMarkPreparing?: () => void;
  onMarkReadyForPickup?: () => void;
  onMarkPickup?: () => void;
  onMarkComplete?: () => void;
}

interface OrderProgressStep {
  label: string;
  matches: OrderStatus[];
}

const PROGRESS_STEPS: OrderProgressStep[] = [
  {
    label: "Đã xác nhận",
    matches: ["DRAFT", "CONFIRMED"],
  },
  {
    label: "Đang chuẩn bị",
    matches: ["PREPARING"],
  },
  {
    label: "Sẵn sàng bàn giao",
    matches: ["READY_FOR_PICKUP"],
  },
  {
    label: "Đang giao",
    matches: ["OUT_FOR_DELIVERY"],
  },
  {
    label: "Giao thành công",
    matches: ["COMPLETED"],
  },
];

const formatShortDate = (value?: string) => {
  if (!value) {
    return "Chờ...";
  }

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
};

const getCurrentStepIndex = (status: OrderStatus) => {
  if (status === "CANCELED") {
    return -1;
  }

  return PROGRESS_STEPS.findIndex((step) => step.matches.includes(status));
};

const getActionableStepConfig = ({
  status,
  onMarkPreparing,
  onMarkReadyForPickup,
  onMarkPickup,
  onMarkComplete,
}: Pick<
  OrderProgressHeaderProps,
  "onMarkPreparing" | "onMarkReadyForPickup" | "onMarkPickup" | "onMarkComplete"
> & {
  status: OrderStatus;
}) => {
  switch (status) {
    case "CONFIRMED":
      return {
        index: 1,
        caption: "Nhấn để chuẩn bị",
        onClick: onMarkPreparing,
      };
    case "PREPARING":
      return {
        index: 2,
        caption: "Chọn staff giao hàng",
        onClick: onMarkReadyForPickup,
      };
    case "READY_FOR_PICKUP":
      return {
        index: 3,
        caption: "Nhấn để giao hàng",
        onClick: onMarkPickup,
      };
    case "OUT_FOR_DELIVERY":
      return {
        index: 4,
        caption: "Nhấn để hoàn tất",
        onClick: onMarkComplete,
      };
    default:
      return null;
  }
};

export const OrderProgressHeader = ({
  order,
  paymentStatus,
  isUpdatingStatus,
  onMarkPreparing,
  onMarkReadyForPickup,
  onMarkPickup,
  onMarkComplete,
}: OrderProgressHeaderProps) => {
  if (order.status === "CANCELED") {
    return (
      <div className="rounded-[24px] border border-rose-100 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-rose-100/70">
        <p className="text-center text-[11px] font-black uppercase tracking-[0.16em] text-rose-500">
          TRẠNG THÁI ĐƠN HÀNG
        </p>
        <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-center">
          <p className="text-sm font-black text-rose-700">Đơn hàng đã bị hủy</p>
          <p className="mt-1 text-xs font-medium text-rose-500">
            Trạng thái hiện tại: Đã hủy
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);
  const isDraftAwaitingPayment = order.status === "DRAFT" && paymentStatus !== "PAID";
  const isDraftPaid = order.status === "DRAFT" && paymentStatus === "PAID";
  const actionableStep = getActionableStepConfig({
    status: order.status,
    onMarkPreparing,
    onMarkReadyForPickup,
    onMarkPickup,
    onMarkComplete,
  });

  return (
    <div className="rounded-[24px] border border-gray-100 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-gray-100/80">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
        TRẠNG THÁI ĐƠN HÀNG
      </p>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="mx-auto min-w-[1040px] px-3">
          <div className="relative">
            <div className="grid grid-cols-5 gap-0">
              {PROGRESS_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isActionable = actionableStep?.index === index && Boolean(actionableStep.onClick);
                const isPending = index > currentStepIndex && !isActionable;
                const isDraftConfirmStep = index === 0 && order.status === "DRAFT";
                const isMutedDraftConfirmStep = isDraftConfirmStep && isDraftAwaitingPayment;
                const hasCompletedLeftConnector = index > 0 && index <= currentStepIndex;
                const hasCompletedRightConnector = index < currentStepIndex;
                const caption =
                  isActionable && isUpdatingStatus
                    ? "Đang cập nhật"
                    : order.status === "DRAFT" && index === 0
                      ? isDraftPaid
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"
                      : isActionable && actionableStep
                        ? actionableStep.caption
                        : index === 0 && !isPending
                          ? formatShortDate(order.created_at)
                          : isCurrent
                            ? "Hiện tại"
                            : isCompleted
                              ? "Đã xong"
                              : "Chờ...";

                return (
                  <button
                    key={step.label}
                    type="button"
                    onClick={() => {
                      actionableStep?.onClick?.();
                    }}
                    disabled={!isActionable || isUpdatingStatus}
                    className={`relative flex flex-col items-center text-center transition ${
                      isActionable
                        ? "cursor-pointer rounded-2xl px-2 py-1 hover:bg-orange-50/60"
                        : "cursor-default px-2 py-1"
                    }`}
                  >
                    {index > 0 && (
                      <span
                        className={`absolute left-0 right-1/2 top-[18px] h-[3px] -translate-y-1/2 rounded-full ${
                          hasCompletedLeftConnector ? "bg-[#A3581E]" : "bg-gray-100"
                        }`}
                      />
                    )}
                    {index < PROGRESS_STEPS.length - 1 && (
                      <span
                        className={`absolute left-1/2 right-0 top-[18px] h-[3px] -translate-y-1/2 rounded-full ${
                          hasCompletedRightConnector ? "bg-[#A3581E]" : "bg-gray-100"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-[3px] bg-white ${
                        isMutedDraftConfirmStep
                          ? "border-gray-200 text-gray-300"
                          : isCompleted
                          ? "border-[#A3581E] bg-[#A3581E] text-white"
                          : isCurrent || isActionable
                            ? "border-[#A3581E] text-[#A3581E]"
                            : "border-gray-100 text-gray-200"
                      }`}
                    >
                      {isActionable && isUpdatingStatus ? (
                        <Loader2 size={15} className="animate-spin" strokeWidth={2.5} />
                      ) : isCompleted ? (
                        <Check size={15} strokeWidth={3} />
                      ) : (
                        <div
                          className={`h-3 w-3 rounded-full ${
                            isMutedDraftConfirmStep
                              ? "bg-gray-300"
                              : isCurrent || isActionable
                                ? "bg-[#A3581E]"
                                : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>

                    <p
                      className={`mt-3 text-sm font-black tracking-tight ${
                        isMutedDraftConfirmStep
                          ? "text-gray-400"
                          : isPending
                            ? "text-gray-400"
                            : isActionable || (isDraftConfirmStep && isDraftPaid)
                              ? "text-[#A3581E]"
                              : "text-gray-900"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-0.5 text-[11px] font-medium ${
                        isMutedDraftConfirmStep
                          ? "text-gray-400"
                          : isPending
                            ? "text-gray-300"
                            : isActionable || (isDraftConfirmStep && isDraftPaid)
                              ? "text-[#C67A3F]"
                              : "text-gray-500"
                      }`}
                    >
                      {caption}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProgressHeader;
