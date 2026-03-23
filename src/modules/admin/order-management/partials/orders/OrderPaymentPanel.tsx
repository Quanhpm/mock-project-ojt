import type { OrderDetail, PaymentDetail } from "../../models/order.models";

const currency = new Intl.NumberFormat("vi-VN");

interface OrderPaymentPanelProps {
  order: OrderDetail;
  payment: PaymentDetail | null;
}

export const OrderPaymentPanel = ({ order, payment }: OrderPaymentPanelProps) => {
  return (
    <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6">
        <h2 className="text-xl font-black tracking-tight text-gray-900">Thanh toán</h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
          Payment Details
        </p>
      </div>

      {payment ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mã giao dịch</p>
            <p className="mt-1 font-bold text-gray-900 uppercase tracking-tight">{payment.code}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trạng thái</p>
            <p className="mt-1 font-bold text-gray-900">{payment.status}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phương thức</p>
            <p className="mt-1 font-bold text-gray-900">
              {payment.method || "Chưa xác định"}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-600/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">Số tiền</p>
            <p className="mt-1 font-black text-amber-800 text-lg">
              {currency.format(payment.amount)}đ
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
          <p className="text-sm font-medium text-gray-500">
            Chưa có thông tin thanh toán chi tiết.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Thành tiền dự kiến: <span className="font-bold text-gray-900">{currency.format(order.final_amount)}đ</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderPaymentPanel;
