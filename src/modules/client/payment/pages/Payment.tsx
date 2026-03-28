import { ROUTER_URL } from "@/routes/router.const";
import { formatCurrency } from "@/utils";
import { ArrowLeft, ReceiptText, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DeliveryInfo } from "../component/DeliveryInfo";
import { OrderSummary } from "../component/OrderSummary";
import { paymentMethods } from "../component/payment-methods";
import { PriceSummary } from "../component/PriceSummary";
import { QRPaymentModal } from "../component/QRPaymentModal";
import { SelectPaymentMethod } from "../component/SelectPaymentMethod";
import { useOrderData } from "../hooks/useOrderData";
import { usePaymentHandler } from "../hooks/usePaymentHandler";
import { useLayoutEffect } from "react";


interface PaymentLocationState {
  cartId?: string;
  orderId?: string;
}

function EmptyCheckoutState() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[var(--cf-bg)] px-4 py-10">
      <div className="absolute left-[-8rem] top-12 h-72 w-72 rounded-full bg-[var(--cf-accent-light)]/30 blur-3xl" />
      <div className="absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-[var(--cf-surface)]/50 blur-3xl" />

      <div className="relative mx-auto max-w-3xl rounded-[30px] border border-[var(--cf-primary)]/10 bg-white/85 p-8 text-center shadow-[0_24px_60px_rgba(127,85,57,0.08)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cf-primary)] text-white shadow-[0_14px_28px_rgba(127,85,57,0.16)]">
          <ReceiptText className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-2xl font-black tracking-tight text-[var(--cf-primary)]">
          Không tìm thấy đơn để thanh toán
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--cf-dark)]">
          Hãy quay lại giỏ hàng hoặc lịch sử đơn hàng và chọn đơn cần thanh toán trước khi tiếp tục.
        </p>

        <button
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--cf-primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_28px_rgba(127,85,57,0.18)] transition-all hover:-translate-y-0.5"
          onClick={() => navigate(ROUTER_URL.HOME_ROUTER.ORDER_HISTORY)}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đơn hàng
        </button>
      </div>
    </div>
  );
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as PaymentLocationState | null) ?? null;
  const cartId = state?.cartId ?? "";
  const orderId = state?.orderId ?? "";

  const { orderData, paymentId } = useOrderData({
    cartId,
    orderId,
  });
  const {
    paying,
    selectedPayment,
    setSelectedPayment,
    showQr,
    setShowQr,
    handleConfirm,
  } = usePaymentHandler(paymentId ?? "");

  const totalAmount = orderData?.final_amount ?? 0;
  const canCheckout = Boolean(orderData && paymentId);
  const selectedPaymentLabel =
    paymentMethods.find((method) => method.id === selectedPayment)?.label ??
    "Chưa chọn";

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.key]);

  if (!cartId && !orderId) {
    return <EmptyCheckoutState />;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[var(--cf-bg)] text-[var(--cf-primary)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-0 h-[20rem] w-[20rem] rounded-full bg-[var(--cf-accent-light)]/22 blur-3xl" />
        <div className="absolute right-[-10rem] top-16 h-[24rem] w-[24rem] rounded-full bg-[var(--cf-surface)]/45 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-5 lg:px-6 lg:pb-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[var(--cf-primary)]/10 bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--cf-primary)] shadow-[0_8px_20px_rgba(127,85,57,0.06)] transition-colors hover:bg-white"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--cf-primary)]/10 bg-white/75 px-3 py-2 text-xs font-semibold text-[var(--cf-primary)] shadow-[0_8px_20px_rgba(127,85,57,0.05)] sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Thanh toán an toàn
          </div>
        </div>

        <section className="rounded-[26px] border border-[var(--cf-primary)]/10 bg-white/85 p-4 shadow-[0_18px_42px_rgba(127,85,57,0.07)] backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--cf-primary)]">
                Xem lại đơn hàng
              </h1>
              <p className="mt-1 text-sm text-[var(--cf-dark)]">
                Kiểm tra món, tổng tiền và chọn phương thức thanh toán.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {orderData?.code && (
                <span className="rounded-full border border-[var(--cf-primary)]/10 bg-[var(--cf-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--cf-primary)]">
                  {orderData.code}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <DeliveryInfo
              address={orderData?.address ?? ""}
              customerName={orderData?.customer_name ?? ""}
              franchiseName={orderData?.franchise_name ?? ""}
              phone={orderData?.phone ?? ""}
              message={orderData?.message ?? ""}
            />

            <OrderSummary
              order_items={orderData?.order_items ?? []}
              orderCode={orderData?.code}
            />
          </div>

          <aside>
            <div className="space-y-4 xl:sticky xl:top-24">
              <PriceSummary
                disabled={!canCheckout}
                onConfirmPayment={() => setShowQr(true)}
                orderData={orderData}
                paying={paying}
                selectedPaymentLabel={selectedPaymentLabel}
              />
              <SelectPaymentMethod
                onSelect={setSelectedPayment}
                selectedPayment={selectedPayment}
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--cf-primary)]/10 bg-[rgba(237,224,212,0.9)] px-4 pb-4 pt-3 shadow-[0_-16px_36px_rgba(127,85,57,0.1)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--cf-secondary)]">
                Tổng thanh toán
              </p>
              <p className="mt-1 text-xl font-black tracking-tight text-[var(--cf-primary)]">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className="rounded-full border border-[var(--cf-primary)]/10 bg-white/85 px-3 py-1.5 text-xs font-semibold text-[var(--cf-primary)]">
              {selectedPaymentLabel}
            </div>
          </div>

          <button
            className={`w-full rounded-full px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(127,85,57,0.18)] transition-all ${
              canCheckout && !paying
                ? "bg-[linear-gradient(135deg,rgba(127,85,57,1),rgba(156,102,68,1))] active:scale-[0.99]"
                : "bg-[var(--cf-primary)]/55"
            }`}
            disabled={!canCheckout || paying}
            onClick={() => setShowQr(true)}
            type="button"
          >
            {paying
              ? "Đang xử lý thanh toán..."
              : `Thanh toán • ${formatCurrency(totalAmount)}`}
          </button>
        </div>
      </div>

      <QRPaymentModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        onConfirm={async () => {
          const result = await handleConfirm();
          if (!result) return;

          navigate(ROUTER_URL.HOME_ROUTER.PAYMENT, {
            state: {
              paymentId,
              total: totalAmount,
            },
          });
        }}
        qrValue={`payment:${selectedPayment}:amount:${totalAmount}`}
        selectedPayment={selectedPayment}
        total={totalAmount}
      />
    </div>
  );
}
