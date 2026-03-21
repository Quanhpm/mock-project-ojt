import type { OrderDetail, PaymentDetail } from "../../models/order.models";

const currency = new Intl.NumberFormat("vi-VN");

interface OrderPaymentPanelProps {
  order: OrderDetail;
  payment: PaymentDetail | null;
}

export const OrderPaymentPanel = ({ order, payment }: OrderPaymentPanelProps) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Payment</h2>
        <p className="mt-1 text-sm text-gray-500">
          Phần payment vẫn đang ở trạng thái tạm thời, hiện ưu tiên hiển thị đọc-only.
        </p>
      </div>

      {payment ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Mã payment</p>
            <p className="mt-2 font-semibold text-gray-900">{payment.code}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Trạng thái</p>
            <p className="mt-2 font-semibold text-gray-900">{payment.status}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Phương thức</p>
            <p className="mt-2 font-semibold text-gray-900">
              {payment.method || "Chưa xác định"}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Số tiền</p>
            <p className="mt-2 font-semibold text-gray-900">
              {currency.format(payment.amount)}đ
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
          Chưa có payment detail xác nhận cho order này. Thành tiền hiện tại là{" "}
          <span className="font-semibold text-gray-900">
            {currency.format(order.final_amount)}đ
          </span>
          .
        </div>
      )}
    </div>
  );
};

export default OrderPaymentPanel;
