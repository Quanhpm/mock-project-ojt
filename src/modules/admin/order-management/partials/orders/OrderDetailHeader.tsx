import { ArrowLeft, Loader2 } from "lucide-react";
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS } from "../../config/order-status.config";
import type { OrderDetail } from "../../models/order.models";

const currency = new Intl.NumberFormat("vi-VN");

interface OrderDetailHeaderProps {
  order: OrderDetail;
  isUpdatingStatus: boolean;
  isEmbedded?: boolean;
  onBack: () => void;
  onPreparing: () => void;
  onReadyForPickup: () => void;
}

export const OrderDetailHeader = ({
  order,
  isUpdatingStatus,
  isEmbedded,
  onBack,
  onPreparing,
  onReadyForPickup,
}: OrderDetailHeaderProps) => {
  const isPreparingAvailable = order.status === "CONFIRMED";
  const isReadyAvailable = order.status === "PREPARING";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          {!isEmbedded && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
          )}

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-400">
              Order Detail
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{order.code}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_BADGES[order.status]}`}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <span className="text-sm text-gray-500">
                Khách hàng: {order.customer_name || order.customer_id}
              </span>
              <span className="text-sm text-gray-500">
                Chi nhánh: {order.franchise_name || order.franchise_id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid min-w-[280px] gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-sm text-amber-800/70">Tạm tính</p>
            <p className="mt-2 text-2xl font-bold text-amber-900">
              {currency.format(order.subtotal_amount)}đ
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Thành tiền</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {currency.format(order.final_amount)}đ
            </p>
          </div>

          <button
            onClick={onPreparing}
            disabled={!isPreparingAvailable || isUpdatingStatus}
            className="rounded-2xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isUpdatingStatus && isPreparingAvailable ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Đang cập nhật
              </span>
            ) : (
              "Chuyển sang Preparing"
            )}
          </button>

          <button
            onClick={onReadyForPickup}
            disabled={!isReadyAvailable || isUpdatingStatus}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {isUpdatingStatus && isReadyAvailable ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Đang cập nhật
              </span>
            ) : (
              "Chuyển sang Ready"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailHeader;
