import { CreditCard, Loader2, TicketPercent } from "lucide-react";
import type { CartDetail } from "../../models/cart.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosReviewSummarySidebarProps {
  cart: CartDetail;
  customerName: string;
  draftPhone: string;
  voucherCode: string;
  isMutatingCart: boolean;
  canApplyVoucher: boolean;
  canCheckout: boolean;
  onDraftPhoneChange: (value: string) => void;
  onVoucherCodeChange: (value: string) => void;
  onApplyVoucher: () => void | Promise<void>;
  onRemoveVoucher?: () => void | Promise<void>;
  onCheckout: () => void | Promise<void>;
}

export const PosReviewSummarySidebar = ({
  cart,
  customerName,
  draftPhone,
  voucherCode,
  isMutatingCart,
  canApplyVoucher,
  canCheckout,
  onDraftPhoneChange,
  onVoucherCodeChange,
  onApplyVoucher,
  onRemoveVoucher,
  onCheckout,
}: PosReviewSummarySidebarProps) => {
  return (
    <aside className="h-fit space-y-6 lg:sticky lg:top-6 lg:col-span-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm leading-relaxed shadow-2xl shadow-black/5">
        <div className="mb-8 w-full border-b border-gray-100 pb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900">
              TÓM TẮT ĐƠN HÀNG
            </h2>
            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs font-bold tracking-wider text-gray-600">
              #{cart._id.slice(-6).toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400">Bước 2: Kiểm tra đơn hàng</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Khách hàng</span>
            <span
              className="max-w-[150px] truncate text-right font-bold text-gray-900"
              title={customerName}
            >
              {customerName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Số điện thoại</span>
            <span className="font-medium text-gray-900">
              <input
                type="tel"
                value={draftPhone}
                onChange={(event) => onDraftPhoneChange(event.target.value)}
                disabled={isMutatingCart}
                className="border-none bg-transparent p-0 text-right font-medium text-gray-900 placeholder:text-gray-400 focus:ring-0 disabled:opacity-50"
                placeholder="Nhập SĐT..."
              />
            </span>
          </div>
        </div>

        <div className="mb-8">
          <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-400">
            VOUCHER / MÃ GIẢM GIÁ
          </label>

          {cart.voucher_code ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <TicketPercent size={18} />
                <span>{cart.voucher_code}</span>
              </div>
              {onRemoveVoucher ? (
                <button
                  type="button"
                  onClick={() => {
                    void onRemoveVoucher();
                  }}
                  disabled={isMutatingCart}
                  className="text-xs font-bold text-red-600 transition hover:text-red-700 disabled:opacity-50"
                >
                  Bỏ mã
                </button>
              ) : null}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={voucherCode}
                onChange={(event) => onVoucherCodeChange(event.target.value.toUpperCase())}
                disabled={isMutatingCart}
                className="flex-grow rounded-xl border-0 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none ring-1 ring-black/5 transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-800 disabled:opacity-50"
                placeholder="Nhập mã giảm giá"
                type="text"
              />
              <button
                type="button"
                onClick={() => {
                  void onApplyVoucher();
                }}
                disabled={!canApplyVoucher || isMutatingCart}
                className="shrink-0 rounded-xl bg-amber-800 px-4 py-2 font-bold text-white transition-colors hover:bg-amber-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50"
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-6">
          <div className="flex justify-between text-gray-500">
            <span>Tạm tính</span>
            <span className="font-semibold text-gray-900">{currency.format(cart.subtotal_amount)}đ</span>
          </div>

          {!!cart.promotion_discount && cart.promotion_discount > 0 ? (
            <div className="flex justify-between text-green-600">
              <span>Khuyến mãi</span>
              <span className="font-semibold">-{currency.format(cart.promotion_discount)}đ</span>
            </div>
          ) : null}

          {!!cart.voucher_discount && cart.voucher_discount > 0 ? (
            <div className="flex justify-between text-green-600">
              <span>Mã giảm giá</span>
              <span className="font-semibold">-{currency.format(cart.voucher_discount)}đ</span>
            </div>
          ) : null}

          <div className="flex justify-between text-gray-500">
            <span>Phí vận chuyển</span>
            <span className="font-semibold text-gray-900">0đ</span>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-dashed border-gray-100 pt-4">
            <span className="text-lg font-bold uppercase tracking-tight text-gray-900">TỔNG CỘNG</span>
            <div className="text-right">
              <span className="block text-3xl font-black text-amber-800">
                {currency.format(cart.final_amount)}
                <span className="mt-0.5 inline-block text-xl">đ</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void onCheckout();
          }}
          disabled={!canCheckout || isMutatingCart}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-800 py-5 font-bold text-white shadow-xl shadow-amber-800/20 transition-all duration-300 hover:bg-amber-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isMutatingCart ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
          <span className="uppercase tracking-wider">
            {isMutatingCart ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </span>
        </button>
        <p className="mt-6 px-4 text-center text-xs text-gray-400">
          Bật tính năng thông báo sau khi xác nhận đơn hàng tại quầy!
        </p>
      </div>
    </aside>
  );
};
