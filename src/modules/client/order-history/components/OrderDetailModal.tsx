import { formatDate, formatCurrency } from '@/utils';
import type { OrderData } from '../order.types';
import { statusConfig } from '../order.config';

interface OrderDetailModalProps {
  open: boolean;
  order: OrderData | null;
  onClose: () => void;
  triggerPosition?: { x: number; y: number } | null;
}

function OrderDetailModal({ open, order, onClose, triggerPosition }: OrderDetailModalProps) {
  if (!open || !order) return null;

  const config = statusConfig[order.status.code];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusIcon = () => {
    switch (order.status.code) {
      case 'COMPLETED':
        return 'check_circle';
      case 'PREPARING':
        return 'skillet';
      case 'CONFIRMED':
        return 'pending';
      case 'CANCELLED':
        return 'cancel';
      default:
        return 'receipt';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{
        animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="bg-white dark:bg-[#1a130c] border border-slate-200 dark:border-[#483623] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          animation: 'popOut 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: triggerPosition
            ? `${triggerPosition.x}px ${triggerPosition.y}px`
            : 'center center',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              backdrop-filter: blur(0px);
            }
            to {
              opacity: 1;
              backdrop-filter: blur(4px);
            }
          }
          @keyframes popOut {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #483623;
            border-radius: 10px;
          }
        `}</style>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-[#483623] bg-white dark:bg-[#1a130c]">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <span className="material-symbols-outlined text-3xl">coffee</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Chi tiết đơn hàng #{order.code}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#c9ad92] font-medium uppercase tracking-wider">
                {order.store.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-[#483623] transition-colors text-slate-500 dark:text-[#c9ad92] cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Status & Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Order Status Card */}
              <div
                className={`p-4 rounded-lg border ${
                  order.status.code === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : order.status.code === 'CANCELLED'
                    ? 'bg-rose-500/10 border-rose-500/20'
                    : 'bg-primary/10 border-primary/20'
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined ${
                      order.status.code === 'PREPARING' ? 'animate-pulse' : ''
                    } ${
                      order.status.code === 'COMPLETED'
                        ? 'text-emerald-500'
                        : order.status.code === 'CANCELLED'
                        ? 'text-rose-500'
                        : 'text-primary'
                    }`}
                  >
                    {getStatusIcon()}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        order.status.code === 'COMPLETED'
                          ? 'text-emerald-500'
                          : order.status.code === 'CANCELLED'
                          ? 'text-rose-500'
                          : 'text-primary'
                      }`}
                    >
                      Trạng thái đơn hàng
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{config.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-[#c9ad92]">Ngày đặt</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatDate(order.meta.created_at)}
                  </p>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#221a11]/50 border border-slate-100 dark:border-[#483623]">
                  <p className="text-xs font-semibold text-slate-500 dark:text-[#c9ad92] uppercase tracking-wider mb-1">
                    Kênh đặt hàng
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{order.channel}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#221a11]/50 border border-slate-100 dark:border-[#483623]">
                  <p className="text-xs font-semibold text-slate-500 dark:text-[#c9ad92] uppercase tracking-wider mb-1">
                    Số lượng món
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">shopping_basket</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{order.meta.items_count}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">info</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Thông tin đơn hàng
                    </p>
                    <p className="text-xs text-slate-500 dark:text-[#c9ad92]">
                      Đơn hàng được đặt qua kênh <span className="font-semibold">{order.channel}</span> tại cửa hàng{' '}
                      <span className="font-semibold">{order.store.name}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline & Payment */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Vertical Timeline */}
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#221a11]/50 border border-slate-100 dark:border-[#483623]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-[#c9ad92] mb-6">
                  Tiến độ đơn hàng
                </h3>
                <div className="relative space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-[#483623]" />

                  {/* Step 1 (Done) */}
                  <div className="relative flex items-start gap-4">
                    <div className="z-10 size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Đã đặt hàng</p>
                      <p className="text-xs text-slate-500 dark:text-[#c9ad92]">
                        {formatDate(order.meta.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  {(order.status.code === 'CONFIRMED' ||
                    order.status.code === 'PREPARING' ||
                    order.status.code === 'COMPLETED') && (
                    <div className="relative flex items-start gap-4">
                      <div className="z-10 size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Đã xác nhận</p>
                        <p className="text-xs text-slate-500 dark:text-[#c9ad92]">Cửa hàng đã xác nhận</p>
                      </div>
                    </div>
                  )}

                  {/* Step 3 (Current/Done) */}
                  {order.status.code === 'PREPARING' || order.status.code === 'COMPLETED' ? (
                    <div className="relative flex items-start gap-4">
                      <div
                        className={`z-10 size-6 rounded-full flex items-center justify-center shrink-0 ${
                          order.status.code === 'COMPLETED'
                            ? 'bg-primary'
                            : 'bg-primary/20 border-2 border-primary'
                        }`}
                      >
                        {order.status.code === 'COMPLETED' ? (
                          <span className="material-symbols-outlined text-white text-sm">check</span>
                        ) : (
                          <div className="size-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            order.status.code === 'COMPLETED'
                              ? 'text-slate-900 dark:text-white'
                              : 'text-primary'
                          }`}
                        >
                          Đang chuẩn bị
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#c9ad92]">Đang pha chế thức uống</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Step 4 */}
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`z-10 size-6 rounded-full flex items-center justify-center shrink-0 ${
                        order.status.code === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : order.status.code === 'CANCELLED'
                          ? 'bg-rose-500'
                          : 'bg-slate-200 dark:bg-[#483623]'
                      }`}
                    >
                      {order.status.code === 'COMPLETED' && (
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      )}
                      {order.status.code === 'CANCELLED' && (
                        <span className="material-symbols-outlined text-white text-sm">close</span>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          order.status.code === 'COMPLETED'
                            ? 'text-emerald-500'
                            : order.status.code === 'CANCELLED'
                            ? 'text-rose-500'
                            : 'text-slate-400 dark:text-[#634e38]'
                        }`}
                      >
                        {order.status.code === 'CANCELLED' ? 'Đã hủy' : 'Hoàn thành'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-[#634e38]">
                        {order.status.code === 'CANCELLED'
                          ? 'Đơn hàng đã bị hủy'
                          : order.status.code === 'COMPLETED'
                          ? 'Đã giao hàng thành công'
                          : 'Chờ giao hàng'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#221a11]/50 border border-slate-100 dark:border-[#483623]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-[#c9ad92] mb-4">
                  Chi tiết thanh toán
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-[#c9ad92]">Tổng tiền hàng</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {formatCurrency(order.pricing.total)}
                    </span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-[#483623] flex justify-between items-end">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Tổng cộng</span>
                    <span className="text-3xl font-extrabold text-primary tracking-tight">
                      {formatCurrency(order.pricing.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="px-6 py-5 border-t border-slate-200 dark:border-[#483623] bg-white dark:bg-[#1a130c] flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-lg bg-primary font-bold text-sm text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}

export default OrderDetailModal;
