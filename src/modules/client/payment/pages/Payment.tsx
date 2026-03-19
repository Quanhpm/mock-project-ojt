import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getOrderbyId } from "@/apis/endpointsCLIENT/payment.api";
import { getPaymentByOrderId, confirmPayment } from "@/apis/endpointsCLIENT/payment.api";
import type { GetOrdersByCustomerIdResponse, ClientOrder } from "@/apis";
import type { PaymentResponse, OrderResponse, OrderItem } from "@/apis/endpointsCLIENT/payment.api";
import { getFranchiseDetail } from "@/apis";
import type { OrdersResponse } from "../../order-history/order.types";
import { toast } from "sonner";
import useToast from "@/hooks/use-toast.hook";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { QRPaymentModal } from "../component/QRPaymentModal";

const QR_METHODS = ["momo", "banking", "zalopay"];

type PaymentMethod = {
  id: string;
  label: string;
  icon: ReactNode;
};

const paymentMethods = [
  {
    id: "CASH",
    label: "Tiền mặt",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a4 4 0 00-8 0v2M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: "MOMO",
    label: "Ví MoMo",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "CARD",
    label: "Thẻ",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "VNPAY",
    label: "VNPay",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const fmt = (n: number | undefined): string => {
  if (n !== undefined && n !== null) {
    return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  }
  return "0 ₫"; // Hoặc "" tùy bạn muốn hiển thị khi không có data
};

export default function Payment() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [paying, setPaying] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("CASH");
  const [showQr, setShowQr] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const location = useLocation();
  const orderId: string = (location.state as { orderId?: string })?.orderId ?? '';

  const [orderData, setOrderData] = useState<OrderResponse>();
  const fetchOrderData = async () => {
    try {
      const response = await getOrderbyId(orderId);
      if (response) setOrderData(response)
    }
    catch (error) {
      console.error("Failed to fetch order data:", error)
    }
  }
  const [paymentData, setPaymentData] = useState<PaymentResponse>()
  const fetchPaymentData = async () => {
    try {
      const response = await getPaymentByOrderId(orderId);
      if (response) setPaymentData(response)
    }
    catch (error) {
      console.error("Failed to fetch payment data:", error)
    }
  }
  useEffect(() => {
    const fetch = async () => {
      await fetchOrderData();
      await fetchPaymentData();
    }
    fetch();
  }, [])

  const handleConfirmPayment = async () => {
    try {
      setPaying(true);
      if (selectedPayment !== "CASH" && selectedPayment !== "CARD") {
        setShowQr(true);
      }

      const res = await confirmPayment(paymentData?._id ?? "", {
        method: selectedPayment,
      });
      success("Thanh toán thành công");
      setTimeout(() => {
        navigate("/"); // đổi route bạn muốn
      }, 5000);
    } catch (e) {
      console.error("Payment error:", e);
      error("Thanh toán thất bại")
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--cf-bg)] px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
        {/* Cột trái */}
        <div className="flex flex-col gap-4">
          {/* ── Block 1: Địa điểm ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
              Thông tin giao hàng
            </p>

            <div className="flex flex-col gap-3">
              {/* Đặt tại */}
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-primary)]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>

                <div>
                  <p className="mb-0.5 text-[10px] text-[var(--cf-secondary)]">Đặt tại</p>
                  <p className="text-sm font-semibold text-[var(--cf-primary)]">
                    {orderData?.franchise_name}
                  </p>
                </div>
              </div>

              {/* Giao đến */}
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-dark)]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.038A2 2 0 0115 11.1V14h.95a2.5 2.5 0 014.9 0H20a1 1 0 001-1V8a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-5V4a1 1 0 00-1-1H3z" />
                  </svg>
                </span>

                <div>
                  <p className="mb-0.5 text-[10px] text-[var(--cf-secondary)]">Giao đến</p>
                  <p className="text-sm font-semibold text-[var(--cf-primary)]">
                    {orderData?.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Block 2: Đơn hàng ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
                Đơn hàng
              </p>

              <span className="rounded-full bg-[var(--cf-accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--cf-primary)]">
                {orderData?.order_items.length} món
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {orderData?.order_items.map((p) => (
                <div
                  key={p.order_item_id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--cf-accent-light)] bg-[var(--cf-bg)] p-3"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--cf-primary)] text-xs font-bold text-white">
                    {p.quantity}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight text-[var(--cf-primary)]">
                      {p.product_name}
                    </p>
                    {p.options.length > 0 && p.options.map((op) => (
                      <p key={op.product_franchise_id} className="mt-0.5 truncate text-[11px] text-[var(--cf-secondary)]">
                        {op.product_name} - {fmt(op.final_price)}
                      </p>
                    ))}
                  </div>
                  <p className="flex-shrink-0 text-sm font-bold text-[var(--cf-dark)]">
                    {fmt(p.price_snapshot * p.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          {/* ── Block 3: Tóm tắt giá ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
              Chi tiết thanh toán
            </p>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-[var(--cf-secondary)]">
                <span>Giá gốc</span>
                <span>{fmt(orderData?.subtotal_amount)}</span>
              </div>

              {orderData !== undefined && orderData?.promotion_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#4A7C59]">Giảm giá từ promotion</span>
                  <span className="font-semibold text-[#4A7C59]">− {fmt(orderData.promotion_discount)}</span>
                </div>
              )}
              {orderData !== undefined && orderData?.voucher_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#4A7C59]">Giảm giá từ voucher</span>
                  <span className="font-semibold text-[#4A7C59]">− {fmt(orderData.voucher_discount)}</span>
                </div>
              )}
              {orderData !== undefined && orderData?.loyalty_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#4A7C59]">Giảm giá từ điểm thành viên</span>
                  <span className="font-semibold text-[#4A7C59]">− {fmt(orderData.loyalty_discount)}</span>
                </div>
              )}

              <div className="my-1 h-px bg-[var(--cf-accent-light)]" />

              <div className="flex justify-between">
                <span className="text-base font-bold text-[var(--cf-primary)]">Tổng cộng</span>
                <span className="text-base font-extrabold text-[var(--cf-dark)]">
                  {fmt(orderData?.final_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Block 4: Phương thức thanh toán ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
              Phương thức thanh toán
            </p>

            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-all duration-200 ${isSelected
                      ? "border-[var(--cf-primary)] bg-[var(--cf-primary)] text-white"
                      : "border-[var(--cf-accent-light)] bg-[var(--cf-bg)] text-[var(--cf-primary)]"
                      }`}
                  >
                    <span className="flex-shrink-0">{method.icon}</span>
                    <span className="text-sm font-semibold leading-tight">{method.label}</span>

                    {isSelected && (
                      <span className="ml-auto flex-shrink-0">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Nút Thanh toán ── */}
          <button
            onClick={handleConfirmPayment}
            disabled={paying}
            className={`w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition-all duration-300 ${paying ? "bg-[#4A7C59] opacity-90" : "bg-[var(--cf-primary)] opacity-100"
              }`}
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              `Thanh toán`
            )}
          </button>
        </div>
      </div>

      <QRPaymentModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        onConfirm={() => {
          setConfirmed(true);
          setTimeout(() => setConfirmed(false), 2000);
        }}
        total={orderData ? orderData.final_amount : 0}
        qrValue={`payment:${selectedPayment}:amount:${orderData ? orderData.final_amount : 0}`}
      />
    </div>
  );
}