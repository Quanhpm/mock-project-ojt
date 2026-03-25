import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPaymentByOrderId } from '@/apis/endpointsCLIENT/payment.api';
import useToast from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import type { OrderData } from '../../order.types';
import { Coffee, X } from 'lucide-react';
import OrderFailedReason from './OrderFailedReason';
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
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [isOpeningPayment, setIsOpeningPayment] = useState(false);

  if (!open || !order) return null;

  const isConfirmedOrder = order.status.code === 'CONFIRMED';
  const isDraftOrder = order.status.code === 'DRAFT';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleReviewPayment = async () => {
    if (isOpeningPayment) return;

    setIsOpeningPayment(true);

    try {
      const payment = await getPaymentByOrderId(String(order.id));

      if (!payment?._id) {
        showError('Không tìm thấy thông tin thanh toán cho đơn này');
        return;
      }

      onClose();
      navigate(ROUTER_URL.HOME_ROUTER.PAYMENT, {
        state: {
          paymentId: payment._id,
          total: order.pricing.finalAmount ?? order.pricing.total,
        },
      });
    } catch (error) {
      console.error('Failed to fetch payment by order id:', error);
      showError('Không thể tải lại thông tin thanh toán');
    } finally {
      setIsOpeningPayment(false);
    }
  };

  const handleContinueCheckout = () => {
    if (isOpeningPayment) return;

    if (!order.id) {
      showError('Không tìm thấy thông tin đơn hàng để tiếp tục thanh toán');
      return;
    }

    onClose();
    navigate(ROUTER_URL.HOME_ROUTER.CHECKOUT, {
      state: {
        orderId: String(order.id),
      },
    });
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
              <Coffee className="size-8" />
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
            <X className="size-5" />
          </button>
        </header>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <OrderStatusHeader order={order} />
              <OrderFailedReason status={order.status.code} reason={order.cancelReason} />
              <OrderItemsList items={order.orderItems} />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <OrderTimeline status={order.status.code} createdAt={order.meta.created_at} />
              <OrderPaymentInfo pricing={order.pricing} status={order.status.code} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="px-6 py-5 border-t border-slate-100 bg-[#fdfcfb] flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isDraftOrder ? (
            <button
              onClick={handleContinueCheckout}
              disabled={isOpeningPayment}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-primary/20 bg-white font-bold text-sm text-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Tiếp tục thanh toán
            </button>
          ) : null}
          {isConfirmedOrder ? (
            <button
              onClick={handleReviewPayment}
              disabled={isOpeningPayment}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-primary/20 bg-white font-bold text-sm text-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              {isOpeningPayment ? 'Đang tải thanh toán...' : 'Xem lại thanh toán'}
            </button>
          ) : null}
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
