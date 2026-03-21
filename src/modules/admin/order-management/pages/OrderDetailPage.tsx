import { useNavigate, useParams } from "react-router-dom";
import { OrderDetailHeader } from "../partials/orders/OrderDetailHeader";
import { OrderDetailItems } from "../partials/orders/OrderDetailItems";
import { OrderPaymentPanel } from "../partials/orders/OrderPaymentPanel";
import { useOrderDetailPage } from "../hooks/use-order-detail-page";

const currency = new Intl.NumberFormat("vi-VN");

interface OrderDetailPageProps {
  providedOrderId?: string;
  isEmbedded?: boolean;
}

export const OrderDetailPage = ({ providedOrderId, isEmbedded }: OrderDetailPageProps = {}) => {
  const navigate = useNavigate();
  const params = useParams<{ orderId: string }>();
  const orderId = providedOrderId || params.orderId;
  const {
    order,
    payment,
    isLoading,
    isUpdatingStatus,
    markPreparing,
    markReadyForPickup,
  } = useOrderDetailPage(orderId);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 text-gray-400 shadow-sm">
        Đang tải chi tiết đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-gray-400 shadow-sm">
        Không tìm thấy order detail.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderDetailHeader
        order={order}
        isUpdatingStatus={isUpdatingStatus}
        onBack={() => navigate(-1)}
        isEmbedded={isEmbedded}
        onPreparing={() => {
          void markPreparing();
        }}
        onReadyForPickup={() => {
          void markReadyForPickup();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <OrderDetailItems items={order.order_items} />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Thông tin đơn</h2>
            <div className="mt-5 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between gap-4">
                <span>Khách hàng</span>
                <span className="text-right font-medium text-gray-900">
                  {order.customer_name || order.customer_id}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Số điện thoại</span>
                <span className="text-right font-medium text-gray-900">{order.phone || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Địa chỉ</span>
                <span className="text-right font-medium text-gray-900">{order.address || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Message</span>
                <span className="text-right font-medium text-gray-900">{order.message || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Khuyến mãi</span>
                <span className="text-right font-medium text-gray-900">
                  {currency.format(order.promotion_discount)}đ
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Voucher</span>
                <span className="text-right font-medium text-gray-900">
                  {currency.format(order.voucher_discount)}đ
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Thành tiền</span>
                <span className="text-right font-semibold text-amber-800">
                  {currency.format(order.final_amount)}đ
                </span>
              </div>
            </div>
          </div>

          <OrderPaymentPanel order={order} payment={payment} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
