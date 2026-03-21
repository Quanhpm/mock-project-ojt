import type { OrderData } from '../../order.types';
import OrderItemsList from './OrderItemsList';
import OrderPaymentInfo from './OrderPaymentInfo';
import OrderStatusHeader from './OrderStatusHeader';
import OrderTimeline from './OrderTimeline';

interface OrderDetailModalProps {
  open: boolean;
  order: OrderData | null;
  onClose: () => void;
  triggerPosition?: { x: number; y: number } | null;
}

function OrderDetailModal({ open, order, onClose, triggerPosition }: OrderDetailModalProps) {
  if (!open || !order) return null;
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
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
        className="bg-[#fdfcfb] border border-slate-100 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          animation: 'popOut 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: triggerPosition
            ? `${triggerPosition.x}px ${triggerPosition.y}px`
            : 'center center',
        }}
      >
        <style>{`@keyframes fadeIn{from{opacity:0;backdrop-filter:blur(0)}to{opacity:1;backdrop-filter:blur(4px)}}@keyframes popOut{0%{opacity:0;transform:scale(0)}50%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#d8c8b8;border-radius:10px}`}</style>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#fdfcfb]">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <span className="material-symbols-outlined text-3xl">coffee</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1a130c]">
                Chi tiết đơn hàng #{order.code}
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {order.store.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <OrderStatusHeader order={order} />
              <OrderItemsList items={order.orderItems} />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <OrderTimeline status={order.status.code} createdAt={order.meta.created_at} />
              <OrderPaymentInfo pricing={order.pricing} status={order.status.code} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="px-6 py-5 border-t border-slate-100 bg-[#fdfcfb] flex justify-end">
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
