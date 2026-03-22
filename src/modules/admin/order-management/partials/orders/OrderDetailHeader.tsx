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
    <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          {!isEmbedded && (
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 active:scale-95"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Quay lại danh sách
            </button>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900">{order.code}</h1>
              <span
                className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5 ${ORDER_STATUS_BADGES[order.status]}`}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">👤</span>
                <span className="text-gray-900">{order.customer_name || order.customer_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300">📍</span>
                <span className="text-gray-600 font-medium">{order.franchise_name || order.franchise_id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <div className="flex flex-col rounded-2xl bg-gray-50 px-5 py-3 ring-1 ring-black/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tạm tính</span>
              <span className="mt-1 text-lg font-black text-gray-900">{currency.format(order.subtotal_amount)}đ</span>
            </div>
            <div className="flex flex-col rounded-2xl bg-amber-50 px-5 py-3 ring-1 ring-amber-600/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">Thành tiền</span>
              <span className="mt-1 text-lg font-black text-amber-800">{currency.format(order.final_amount)}đ</span>
            </div>
          </div>

          <div className="flex h-full gap-2">
            <button
              onClick={onPreparing}
              disabled={!isPreparingAvailable || isUpdatingStatus}
              className="flex h-14 items-center justify-center rounded-2xl bg-amber-700 px-6 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-amber-700/20 transition hover:bg-amber-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:shadow-none"
            >
              {isUpdatingStatus && isPreparingAvailable ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Preparing"
              )}
            </button>

            <button
              onClick={onReadyForPickup}
              disabled={!isReadyAvailable || isUpdatingStatus}
              className="flex h-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 text-sm font-black uppercase tracking-widest text-emerald-700 shadow-sm transition hover:bg-emerald-100 active:scale-95 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isUpdatingStatus && isReadyAvailable ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Ready"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailHeader;
