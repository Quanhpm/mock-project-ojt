import { memo } from "react";
import { Loader2, Minus, Plus, Search, TicketPercent, Trash2, User } from "lucide-react";
import type { CartDetail, CartItem } from "../../models/cart.models";
import type { CustomerOption } from "../../models/customer.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosCartSidebarProps {
  cart: CartDetail | null;
  items: CartItem[];
  subtotalAmount: number;
  finalAmount: number;
  selectedCustomer: CustomerOption | null;
  customerKeyword?: string;
  customerResults?: CustomerOption[];
  draftAddress: string;
  draftPhone: string;
  draftMessage: string;
  voucherCode: string;
  showCustomerSearch?: boolean;
  isSearchingCustomers: boolean;
  isMutatingCart: boolean;
  onCustomerKeywordChange?: (value: string) => void;
  onSearchCustomers?: () => void;
  onSelectCustomer?: (customer: CustomerOption) => void;
  onClearCustomer?: () => void;
  onAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onVoucherCodeChange: (value: string) => void;
  onAddOneMore: (item: CartItem) => void;
  onDecreaseItem: (item: CartItem) => void;
  onRemoveItem: (cartItemId: string) => void;
  onSaveCartInfo: () => void;
  canApplyVoucher: boolean;
  onApplyVoucher: () => void;
  onRemoveVoucher?: () => void;
  canCheckout: boolean;
  onCheckout: () => void;
}

export const PosCartSidebar = memo(({
  cart,
  items,
  subtotalAmount,
  finalAmount,
  selectedCustomer,
  customerKeyword = "",
  customerResults = [],
  draftAddress,
  draftPhone,
  draftMessage,
  voucherCode,
  showCustomerSearch = true,
  isSearchingCustomers,
  isMutatingCart,
  onCustomerKeywordChange,
  onSearchCustomers,
  onSelectCustomer,
  onClearCustomer,
  onAddressChange,
  onPhoneChange,
  onMessageChange,
  onVoucherCodeChange,
  onAddOneMore,
  onDecreaseItem,
  onRemoveItem,
  onSaveCartInfo,
  canApplyVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  canCheckout,
  onCheckout,
}: PosCartSidebarProps) => {
  const cartNumber = cart?._id ? cart._id.slice(-6).toUpperCase() : items.length > 0 ? "DRAFT" : "NEW";
  const customerDisplayName = selectedCustomer?.name || cart?.customer_name;
  const customerDisplayPhone = selectedCustomer?.phone || cart?.phone;
  const customerDisplayEmail = selectedCustomer?.email || "";

  return (
    <aside className="z-10 flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-gray-100 bg-white lg:h-full lg:w-96 lg:border-l lg:border-t-0">
      {/* Khách hàng & Mã đơn */}
      <div className="shrink-0 border-b border-gray-50 bg-white p-4 pb-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
            Order #{cartNumber}
          </h2>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            Tại quầy
          </span>
        </div>
        <div className="relative mt-2">
          {/* Card Khách hàng */}
          <div className="group flex items-center gap-4 rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5 transition-colors hover:bg-gray-100">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
              <User size={20} />
            </div>

            <div className="min-w-0 flex-1">
              {customerDisplayName ? (
                <>
                  <p className="truncate text-sm font-bold text-gray-900">{customerDisplayName}</p>
                  <p className="truncate text-xs text-gray-500">
                    {customerDisplayPhone}
                    {customerDisplayEmail ? ` • ${customerDisplayEmail}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-gray-600">Thêm khách hàng</p>
              )}
            </div>

            {showCustomerSearch && customerDisplayName ? (
              <button
                onClick={onClearCustomer}
                className="text-sm font-bold text-amber-700 opacity-80 transition hover:opacity-100"
              >
                Đổi
              </button>
            ) : null}
          </div>

          {showCustomerSearch ? (
            <>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={customerKeyword}
                    onChange={(event) => onCustomerKeywordChange?.(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        onSearchCustomers?.();
                      }
                    }}
                    className="w-full rounded-xl bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 ring-1 ring-black/5 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-700/20"
                    placeholder="Tìm SĐT hoặc Tên..."
                    type="text"
                  />
                </div>

                <button
                  type="button"
                  onClick={onSearchCustomers}
                  disabled={isSearchingCustomers}
                  className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSearchingCustomers ? "..." : "Tìm"}
                </button>
              </div>

              {customerResults.length > 0 && (
                <div className="absolute left-0 right-0 z-20 mt-2 max-h-[300px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5">
                  {customerResults.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => onSelectCustomer?.(customer)}
                      className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-amber-50"
                    >
                      <p className="font-bold text-gray-900">{customer.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {customer.phone}
                        {customer.email ? ` • ${customer.email}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-gray-50/30">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center space-y-3 text-center text-gray-400">
              <div className="rounded-full bg-gray-100 p-4">
                <Loader2 size={24} className="opacity-0" />
              </div>
              <p className="text-sm font-medium">Chưa có món nào được chọn</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="group flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5">
                        {item.product?.image_url || item.product_image_url ? (
                          <img
                            src={item.product?.image_url || item.product_image_url}
                            alt={item.product?.name || item.product_name || "Sản phẩm"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
                            Ảnh
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-base font-bold leading-tight text-gray-900">
                          {item.product?.name || item.product_name || item.product_franchise_id}
                        </p>

                        {item.selected_size_label && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                            <span className="h-1 w-1 rounded-full bg-amber-500" />
                            Size {item.selected_size_label}
                          </p>
                        )}

                        {item.options.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-gray-500">
                            {item.options.map((option) => (
                              <li key={`${item.cart_item_id}-${option.product_franchise_id}`} className="flex items-start gap-1">
                                <span className="text-gray-400">+</span>
                                <span>{option.product?.name || option.product_name} <span className="font-semibold text-gray-700">x{option.quantity}</span></span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {item.note && (
                          <div className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs italic text-yellow-800">
                            "{item.note}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-amber-800">
                        {currency.format(item.final_line_total)}<span className="text-xs">đ</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-gray-50 p-1">
                      <button
                        onClick={() => onDecreaseItem(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => onAddOneMore(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition hover:bg-amber-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.cart_item_id)}
                      className="rounded-full p-2 text-gray-300 opacity-100 transition-all hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Xóa món"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      <div className="shrink-0 space-y-4 border-t border-gray-100 bg-white px-4 py-5 sm:px-6">
          <textarea
            value={draftMessage}
            onChange={(event) => onMessageChange(event.target.value)}
            className="w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 ring-1 ring-black/5 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20"
            placeholder="Ghi chú tổng cho đơn hàng..."
            rows={2}
          />

          <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                <TicketPercent size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900">Voucher</h3>
                <p className="text-xs text-gray-500">Nhập mã giảm giá cho cart hiện tại</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={voucherCode}
                onChange={(event) => onVoucherCodeChange(event.target.value.toUpperCase())}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-amber-700/20"
                placeholder="Nhập mã voucher"
                type="text"
              />
              <button
                onClick={onApplyVoucher}
                disabled={!canApplyVoucher || isMutatingCart}
                className="w-full shrink-0 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:w-auto"
              >
                Áp dụng
              </button>
            </div>

            {cart?.voucher_code ? (
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-green-700">
                  Đang áp dụng: {cart.voucher_code}
                </p>
                {onRemoveVoucher ? (
                  <button
                    onClick={onRemoveVoucher}
                    disabled={isMutatingCart}
                    className="shrink-0 text-xs font-bold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Bỏ mã
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Chọn khách hàng và có ít nhất một món để áp mã.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Thông tin nhận hàng
            </h3>
            <div className="space-y-3">
              <input
                value={draftPhone}
                onChange={(event) => onPhoneChange(event.target.value)}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-amber-700/20"
                placeholder="Số điện thoại nhận"
                type="tel"
              />
              <input
                value={draftAddress}
                onChange={(event) => onAddressChange(event.target.value)}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-amber-700/20"
                placeholder="Địa chỉ giao/nhận"
                type="text"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative shrink-0 border-t border-gray-100 bg-white p-6">
        <div className="mb-4 space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>Tạm tính</span>
            <span className="font-semibold text-gray-800">
              {currency.format(subtotalAmount)}đ
            </span>
          </div>
          {cart?.promotion_discount ? (
            <div className="flex items-center justify-between text-green-600">
              <span>Khuyến mãi</span>
              <span className="font-semibold">-{currency.format(cart.promotion_discount)}đ</span>
            </div>
          ) : null}
          {cart?.voucher_discount ? (
            <div className="flex items-center justify-between text-green-600">
              <span>Mã giảm giá</span>
              <span className="font-semibold">-{currency.format(cart.voucher_discount)}đ</span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={onSaveCartInfo}
            disabled={!cart?._id || isMutatingCart}
            className="flex h-14 items-center justify-center rounded-2xl bg-gray-100 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          >
            Lưu
          </button>

          <button
            onClick={onCheckout}
            disabled={!canCheckout || isMutatingCart}
            className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-amber-700 px-6 font-bold shadow-lg shadow-amber-700/25 transition-[transform,shadow,background] hover:bg-amber-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            <div className="flex w-full items-center justify-between text-white">
              {isMutatingCart ? (
                <div className="flex w-full justify-center">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                <>
                  <span className="text-base uppercase tracking-wider">Pay</span>
                  <span className="text-lg font-black">{currency.format(finalAmount)}đ</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
});

export default PosCartSidebar;
