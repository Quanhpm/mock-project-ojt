import { useState } from "react";
import {
  Banknote,
  ChevronLeft,
  Landmark,
  Loader2,
  Printer,
  QrCode,
  Share2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/utils/cn";
import {
  PAYMENT_STATUS_BADGES,
  PAYMENT_STATUS_LABELS,
} from "../config/order-status.config";
import { useOrderDetailPage } from "../hooks/use-order-detail-page";
import { useOrderFranchiseContext } from "../hooks/use-order-franchise-context";
import { useOrderPrint } from "../hooks/use-order-print";
import { PosFranchiseSelectionGate } from "../partials/pos/PosFranchiseSelectionGate";
import { OrderInvoiceSheet } from "../partials/orders/OrderInvoiceSheet";
import { OrderProgressHeader } from "../partials/orders/OrderProgressHeader";
import { OrderReadyForPickupModal } from "../partials/orders/OrderReadyForPickupModal";

const currency = new Intl.NumberFormat("vi-VN");
const SHIPPING_FEE = 0;
const TAX_AMOUNT = 0;
type PaymentMethodOption = "cash" | "transfer" | "vnpay";
const PAYMENT_METHOD_API_VALUES: Record<PaymentMethodOption, "CASH" | "BANK" | "VNPAY"> = {
  cash: "CASH",
  transfer: "BANK",
  vnpay: "VNPAY",
};

interface OrderDetailPageProps {
  providedOrderId?: string;
  isEmbedded?: boolean;
  onOrderStatusUpdated?: () => void | Promise<void>;
}

const formatDisplayDate = (value?: string) => {
  if (!value) {
    return "Chưa có dữ liệu";
  }

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const resolvePaymentMethodSelection = (paymentMethod?: string | null): PaymentMethodOption => {
  const normalizedMethod = paymentMethod?.trim().toUpperCase();

  if (!normalizedMethod) {
    return "cash";
  }

  if (normalizedMethod.includes("VNPAY") || normalizedMethod.includes("QR")) {
    return "vnpay";
  }

  if (
    normalizedMethod.includes("TRANSFER") ||
    normalizedMethod.includes("BANK") ||
    normalizedMethod.includes("CARD")
  ) {
    return "transfer";
  }

  return "cash";
};

export const OrderDetailPage = ({
  providedOrderId,
  isEmbedded,
  onOrderStatusUpdated,
}: OrderDetailPageProps = {}) => {
  const [manualPaymentMethod, setManualPaymentMethod] = useState<PaymentMethodOption | null>(null);
  const navigate = useNavigate();
  const params = useParams<{ orderId: string }>();
  const orderId = providedOrderId || params.orderId;
  const {
    franchiseId,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    switchFranchise,
  } = useOrderFranchiseContext({ enabled: !isEmbedded });
  const canLoadOrderDetail = isEmbedded || Boolean(franchiseId);
  const {
    order,
    payment,
    customer,
    isLoading,
    isUpdatingStatus,
    isConfirmingPayment,
    isReadyForPickupModalOpen,
    deliveryAssignees,
    selectedDeliveryAssigneeId,
    isLoadingDeliveryAssignees,
    confirmPayment,
    closeReadyForPickupModal,
    confirmReadyForPickup,
    selectDeliveryAssignee,
    markPreparing,
    markReadyForPickup,
    markPickup,
    markComplete,
  } = useOrderDetailPage(
    canLoadOrderDetail ? orderId : undefined,
    {
      onStatusUpdated: onOrderStatusUpdated,
    },
  );
  const { printRef, handleExportPdf } = useOrderPrint({
    documentTitle: order?.code ? `${order.code}-invoice` : "order-invoice",
  });

  if (!isEmbedded && requiresFranchiseSelection) {
    return (
      <main
        className="flex min-h-[calc(100dvh-48px)] flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 shadow-sm lg:h-[calc(100dvh-48px)]"
      >
        <PosFranchiseSelectionGate
          franchiseOptions={franchiseOptions}
          isLoading={isSwitchingFranchise}
          onSelectFranchise={switchFranchise}
        />
      </main>
    );
  }

  if (!isEmbedded && !franchiseId) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm sm:p-8">
        Không xác định được chi nhánh làm việc. Vui lòng kiểm tra franchise context trước khi xử lý đơn hàng.
      </div>
    );
  }

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

  const totalPromotionDiscount = order.promotion_discount ?? 0;
  const totalVoucherDiscount = order.voucher_discount ?? 0;
  const paymentMethod = manualPaymentMethod ?? resolvePaymentMethodSelection(payment?.method);
  const isPaymentActionDisabled = !payment?._id || payment.status !== "PENDING" || isConfirmingPayment;

  return (
    <div
      className={cn(
        "w-full min-w-0",
        isEmbedded ? "bg-transparent" : "mx-auto max-w-7xl bg-white pb-8 sm:pb-12",
      )}
    >
      <div className="space-y-6 lg:space-y-8">
        <OrderProgressHeader
          order={order}
          paymentStatus={payment?.status}
          isUpdatingStatus={isUpdatingStatus}
          onMarkPreparing={() => {
            void markPreparing();
          }}
          onMarkReadyForPickup={() => {
            void markReadyForPickup();
          }}
          onMarkPickup={() => {
            void markPickup();
          }}
          onMarkComplete={() => {
            void markComplete();
          }}
        />

        <div
          className={cn(
            "grid grid-cols-1 gap-8",
            isEmbedded
              ? "xl:grid-cols-[minmax(0,1fr)_320px]"
              : "lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-14",
          )}
        >
          <div className="min-w-0 space-y-8">
            <OrderInvoiceSheet
              ref={printRef}
              order={order}
              customer={customer}
              headerActions={
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportPdf();
                    }}
                    className="group flex items-center gap-3"
                  >
                    <Printer size={20} className="text-gray-400 group-hover:text-gray-600" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">
                      In hóa đơn
                    </span>
                  </button>
                  <button type="button" className="group flex items-center gap-3">
                    <Share2 size={20} className="text-gray-400 group-hover:text-gray-600" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">
                      Chia sẻ
                    </span>
                  </button>
                </>
              }
            />

            <div className="order-invoice-screen-only flex items-center justify-end gap-8 pt-2">
              <button
                type="button"
                className="text-sm font-bold text-gray-500 transition underline decoration-2 underline-offset-4 hover:text-gray-900"
              >
                Hủy đơn
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExportPdf();
                }}
                className="h-12 rounded-xl bg-[#A3581E] px-8 text-sm font-black text-white shadow-lg shadow-orange-900/10 transition hover:bg-orange-800 active:scale-95"
              >
                Xuất File PDF
              </button>
            </div>
          </div>

          <div
            className={cn(
              "order-detail-sidebar min-w-0 space-y-10 border-gray-100",
              isEmbedded
                ? "border-t pt-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"
                : "border-t pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:pl-10",
            )}
          >
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight text-gray-800">GIÁ TIỀN</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Tạm tính</span>
                  <span className="font-bold text-gray-900">
                    {currency.format(order.subtotal_amount)}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Promotion</span>
                  <span className="font-bold text-rose-500">
                    -{currency.format(totalPromotionDiscount)}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Voucher</span>
                  <span className="font-bold text-rose-500">
                    -{currency.format(totalVoucherDiscount)}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Phí vận chuyển</span>
                  <span className="font-bold text-gray-900">{currency.format(SHIPPING_FEE)}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Thuế</span>
                  <span className="font-bold text-gray-900">{currency.format(TAX_AMOUNT)}đ</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex flex-col items-end gap-1">
                  <p className="text-base font-black uppercase tracking-[0.1em] text-gray-900">
                    TỔNG CỘNG
                  </p>
                  <p className="text-4xl font-black tracking-tight text-[#A3581E]">
                    {currency.format(order.final_amount)}đ
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gray-100" />

            <div className="space-y-6">
              <h2 className="text-xl font-black tracking-tight text-gray-800">THANH TOÁN</h2>

              <div className="grid grid-cols-3 gap-3">
                <button
                  className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all ${paymentMethod === "cash"
                      ? "border-[#A3581E] bg-orange-50/50 text-[#A3581E]"
                      : "border-transparent bg-[#F9FAFB] text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    }`}
                  onClick={() => setManualPaymentMethod("cash")}
                  type="button"
                >
                  <Banknote size={24} strokeWidth={2.5} />
                  <span className="mt-1 text-center text-[10px] font-black uppercase tracking-widest">
                    Tiền mặt
                  </span>
                </button>

                <button
                  className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all ${paymentMethod === "transfer"
                      ? "border-[#A3581E] bg-orange-50/50 text-[#A3581E]"
                      : "border-transparent bg-[#F9FAFB] text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    }`}
                  onClick={() => setManualPaymentMethod("transfer")}
                  type="button"
                >
                  <Landmark size={24} strokeWidth={2.5} />
                  <span className="mt-1 text-center text-[10px] font-black uppercase tracking-widest">
                    Chuyển khoản
                  </span>
                </button>

                <button
                  className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all ${paymentMethod === "vnpay"
                      ? "border-[#A3581E] bg-orange-50/50 text-[#A3581E]"
                      : "border-transparent bg-[#F9FAFB] text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    }`}
                  onClick={() => setManualPaymentMethod("vnpay")}
                  type="button"
                >
                  <QrCode size={24} strokeWidth={2.5} />
                  <span className="mt-1 text-center text-[10px] font-black uppercase tracking-widest">
                    VNPAY
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  void confirmPayment(PAYMENT_METHOD_API_VALUES[paymentMethod]);
                }}
                disabled={isPaymentActionDisabled}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#A3581E] text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-900/10 transition hover:bg-orange-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
              >
                {isConfirmingPayment ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Đang thanh toán
                  </span>
                ) : payment?.status === "PAID" ? (
                  "Đã thanh toán"
                ) : payment?.status === "REFUNDED" ? (
                  "Đã hoàn tiền"
                ) : !payment?._id ? (
                  "Chưa có giao dịch"
                ) : (
                  "Thanh toán"
                )}
              </button>

              {payment ? (
                <div className="space-y-4 rounded-[32px] bg-[#F9FAFB] p-8 ring-1 ring-black/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Mã giao dịch
                    </p>
                    <p className="text-sm font-black text-gray-900">{payment.code}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Trạng thái thanh toán
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${PAYMENT_STATUS_BADGES[payment.status]}`}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Phương thức
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {payment.method || "Chưa xác định"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Số tiền
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {currency.format(payment.amount)}đ
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Thời điểm thanh toán
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {formatDisplayDate(payment.paid_at || payment.updated_at || payment.created_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-[32px] border border-dashed border-gray-200 bg-gray-50/50 p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">
                      Chưa có thông tin thanh toán chi tiết.
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Thành tiền dự kiến:
                      {" "}
                      <span className="font-bold text-gray-900">
                        {currency.format(order.final_amount)}đ
                      </span>
                    </p>
                  </div>
                </div>
              )}

              
            </div>
          </div>
        </div>
      </div>

      {!isEmbedded && (
        <button
          onClick={() => navigate(-1)}
          className="order-last fixed bottom-10 left-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-900 shadow-2xl ring-1 ring-black/10 transition hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <OrderReadyForPickupModal
        open={isReadyForPickupModalOpen}
        staffOptions={deliveryAssignees}
        selectedStaffId={selectedDeliveryAssigneeId}
        isLoading={isLoadingDeliveryAssignees}
        isSubmitting={isUpdatingStatus}
        onClose={closeReadyForPickupModal}
        onSelectStaff={selectDeliveryAssignee}
        onConfirm={() => {
          void confirmReadyForPickup();
        }}
      />
    </div>
  );
};

export default OrderDetailPage;
