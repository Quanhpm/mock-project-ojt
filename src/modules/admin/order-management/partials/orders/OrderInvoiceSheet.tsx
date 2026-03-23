import { forwardRef, type ReactNode } from "react";
import { ORDER_STATUS_LABELS } from "../../config/order-status.config";
import type { CustomerOption } from "../../models/customer.models";
import type { OrderDetail } from "../../models/order.models";

const currency = new Intl.NumberFormat("vi-VN");
const SHIPPING_FEE = 0;
const TAX_AMOUNT = 0;

export interface OrderInvoiceSheetProps {
  order: OrderDetail;
  customer?: CustomerOption | null;
  headerActions?: ReactNode;
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

const getCustomerInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "KH";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export const OrderInvoiceSheet = forwardRef<HTMLDivElement, OrderInvoiceSheetProps>(
  ({ order, customer, headerActions }, ref) => {
    const customerDisplayName =
      customer?.name || order.customer_name || order.customer_id || "Khách hàng";
    const customerDisplayEmail = customer?.email || "Chưa có email";
    const customerDisplayPhone = customer?.phone || order.phone || "Chưa có số điện thoại";
    const customerDisplayAvatar = customer?.avatar_url;
    const deliveryAddress = order.address || customer?.address || "Mua tại quầy";
    const totalPromotionDiscount = order.promotion_discount ?? 0;
    const totalVoucherDiscount = order.voucher_discount ?? 0;
    const totalLoyaltyDiscount = order.loyalty_discount ?? 0;

    return (
      <div
        ref={ref}
        className="order-invoice-print-root rounded-[40px] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 sm:p-12"
      >
        <div className="order-invoice-header flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
              CHI TIẾT ĐƠN HÀNG
            </p>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 sm:text-5xl">
              {order.code}
            </h1>

            <div className="flex flex-wrap gap-8 pt-3">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Ngày tạo
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDisplayDate(order.created_at)}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Trạng thái đơn
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {ORDER_STATUS_LABELS[order.status]}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Chi nhánh
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {order.franchise_name || order.franchise_id}
                </p>
              </div>
            </div>
          </div>

          {headerActions ? (
            <div className="order-invoice-screen-only flex flex-col gap-4 pt-1">
              {headerActions}
            </div>
          ) : null}
        </div>

        <div className="my-10 h-[1px] w-full bg-gray-50" />

        <div className="order-invoice-section-grid grid grid-cols-1 gap-12 sm:grid-cols-2">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
              KHÁCH HÀNG
            </h3>
            <div className="flex items-start gap-4 pt-1">
              {customerDisplayAvatar ? (
                <img
                  src={customerDisplayAvatar}
                  alt={customerDisplayName}
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-black/5"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fae8d9] text-lg font-bold text-[#b35e22]">
                  {getCustomerInitials(customerDisplayName)}
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-lg font-bold text-gray-900">{customerDisplayName}</p>
                <p className="text-sm text-gray-500">{customerDisplayEmail}</p>
                <p className="text-sm text-gray-500">{customerDisplayPhone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
              ĐỊA CHỈ GIAO HÀNG
            </h3>
            <div className="space-y-3 pt-1">
              <div className="max-w-[300px] text-sm leading-relaxed text-gray-700">
                {deliveryAddress}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Ghi chú
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {order.message || "Không có ghi chú từ khách hàng."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="my-12 h-[1px] w-full bg-transparent" />

        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
            SẢN PHẨM ĐÃ CHỌN
          </h3>

          <div className="space-y-10">
            {order.order_items.map((item) => (
              <div key={item.order_item_id} className="order-invoice-item flex items-center gap-6">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-50 p-2 ring-1 ring-black/5">
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-300">
                      NO IMG
                    </div>
                  )}
                </div>
                <div className="flex flex-1 justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900">{item.product_name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.options.length > 0
                        ? item.options
                            .map((option) => `${option.product_name} x${option.quantity}`)
                            .join(" | ")
                        : "Mặc định"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">
                      {item.quantity} x {currency.format(item.price_snapshot)}đ
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Thành tiền: {currency.format(item.final_line_total)}đ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-invoice-summary mt-14 rounded-[24px] bg-[#F8F9FA] p-8 sm:p-10">
          <div className="ml-auto space-y-5 sm:max-w-[320px]">
            <div className="flex justify-between text-base">
              <span className="font-medium text-gray-500">Tạm tính</span>
              <span className="font-bold text-gray-900">{currency.format(order.subtotal_amount)}đ</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-medium text-gray-500">Giảm giá promotion</span>
              <span className="font-bold text-rose-500">
                -{currency.format(totalPromotionDiscount)}đ
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-medium text-gray-500">Giảm giá voucher</span>
              <span className="font-bold text-rose-500">
                -{currency.format(totalVoucherDiscount)}đ
              </span>
            </div>
            {totalLoyaltyDiscount > 0 ? (
              <div className="flex justify-between text-base">
                <span className="font-medium text-gray-500">Giảm giá loyalty</span>
                <span className="font-bold text-rose-500">
                  -{currency.format(totalLoyaltyDiscount)}đ
                </span>
              </div>
            ) : null}
            <div className="flex justify-between text-base">
              <span className="font-medium text-gray-500">Phí vận chuyển</span>
              <span className="font-bold text-gray-900">{currency.format(SHIPPING_FEE)}đ</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-medium text-gray-500">Thuế</span>
              <span className="font-bold text-gray-900">{currency.format(TAX_AMOUNT)}đ</span>
            </div>
            <div className="mt-2 flex items-center justify-between pt-6">
              <span className="text-sm font-black uppercase tracking-[0.15em] text-gray-900">
                TỔNG CỘNG
              </span>
              <span className="text-3xl font-black tracking-tight text-[#A3581E]">
                {currency.format(order.final_amount)}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

OrderInvoiceSheet.displayName = "OrderInvoiceSheet";
