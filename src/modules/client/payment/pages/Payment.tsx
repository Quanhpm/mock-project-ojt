import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRPaymentModal } from "../component/QRPaymentModal";
import { usePaymentData } from "../hooks/usePaymentData";
import { PayButton } from "../component/PayButton";
import { usePaymentHandler } from "../hooks/usePaymentHandler";
import { DeliveryInfo } from "../component/DeliveryInfo";
import { OrderSummary } from "../component/OrderSummary";
import { PriceSummary } from "../component/PriceSummary";
import { SelectPaymentMethod } from "../component/SelectPaymentMethod";


export default function Payment() {
  const [confirmed, setConfirmed] = useState(false);

  const location = useLocation();
  const cartId: string = (location.state as { cartId?: string })?.cartId ?? '';
  const navigate = useNavigate();

  const { orderData, paymentData } = usePaymentData(cartId);
  const paymentId = paymentData ? paymentData._id : "";
  const { paying, selectedPayment, setSelectedPayment, showQr, setShowQr, handleConfirm } = usePaymentHandler(paymentId);

  return (
    <div className="h-full w-full bg-[var(--cf-bg)] px-4 py-6">
      {confirmed && (
        <div className="mx-auto mb-4 max-w-6xl rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          Thanh toán thành công! Vui lòng kiểm tra đơn hàng của bạn.
        </div>
      )}
      <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-4">
        {/* Cột trái */}
        {/* <div className="flex flex-col gap-4"> */}
        {/* ── Block 1: Địa điểm ── */}
        {/* <DeliveryInfo 
              franchiseName={orderData?.franchise_name ?? ""}
              address={orderData?.address ?? ""}
            /> */}

        {/* ── Block 2: Đơn hàng ── */}
        {/* <OrderSummary order_items={orderData?.order_items ?? []} /> */}
        {/* </div> */}

        {/* Cột phải */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          {/* ── Block 3: Tóm tắt giá ── */}
          <PriceSummary orderData={orderData} />

          {/* ── Block 4: Phương thức thanh toán ── */}
          <SelectPaymentMethod
            selectedPayment={selectedPayment}
            onSelect={setSelectedPayment}
          />

          {/* ── Nút Thanh toán ── */}
          <PayButton
            paying={paying}
            onConfirmPayment={() => setShowQr(true)}
          />
        </div>
      </div>

      <QRPaymentModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        onConfirm={() => {
          handleConfirm();
          navigate("/payment", {
            state: {
              paymentId: paymentId,
              total: orderData?.final_amount ?? 0,
            },
          });
        }}
        total={orderData ? orderData.final_amount : 0}
        qrValue={`payment:${selectedPayment}:amount:${orderData ? orderData.final_amount : 0}`}
        selectedPayment={selectedPayment}
      />
    </div>
  );
}