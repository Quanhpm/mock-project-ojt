import { memo } from "react";
import { Loader2, Minus, Search, Trash2, User } from "lucide-react";
import type { CartDetail, CartItem } from "../../models/cart.models";
import type { CustomerOption } from "../../models/customer.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosCartSidebarProps {
  cart: CartDetail | null;
  items: CartItem[];
  subtotalAmount: number;
  finalAmount: number;
  selectedCustomer: CustomerOption | null;
  customerKeyword: string;
  customerResults: CustomerOption[];
  draftAddress: string;
  draftPhone: string;
  draftMessage: string;
  isSearchingCustomers: boolean;
  isMutatingCart: boolean;
  onCustomerKeywordChange: (value: string) => void;
  onSearchCustomers: () => void;
  onSelectCustomer: (customer: CustomerOption) => void;
  onClearCustomer: () => void;
  onAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onAddOneMore: (item: CartItem) => void;
  onDecreaseItem: (item: CartItem) => void;
  onRemoveItem: (cartItemId: string) => void;
  onSaveCartInfo: () => void;
  canCheckout: boolean;
  onCheckout: () => void;
}

export const PosCartSidebar = memo(({
  cart,
  items,
  subtotalAmount,
  finalAmount,
  selectedCustomer,
  customerKeyword,
  customerResults,
  draftAddress,
  draftPhone,
  draftMessage,
  isSearchingCustomers,
  isMutatingCart,
  onCustomerKeywordChange,
  onSearchCustomers,
  onSelectCustomer,
  onClearCustomer,
  onAddressChange,
  onPhoneChange,
  onMessageChange,
  onAddOneMore,
  onDecreaseItem,
  onRemoveItem,
  onSaveCartInfo,
  canCheckout,
  onCheckout,
}: PosCartSidebarProps) => {
  const cartNumber = cart?._id ? cart._id.slice(-6).toUpperCase() : items.length > 0 ? "DRAFT" : "NEW";

  return (
    <aside className="z-10 flex w-96 shrink-0 flex-col border-l border-gray-100 bg-white shadow-xl">
      <div className="shrink-0 border-b border-gray-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-800">Order #{cartNumber}</h2>
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-800">
            Tại quầy
          </span>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-amber-800">
              <User size={18} />
            </div>

            <div className="min-w-0 flex-1">
              {selectedCustomer ? (
                <>
                  <p className="truncate text-sm font-bold text-gray-800">{selectedCustomer.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {selectedCustomer.phone}
                    {selectedCustomer.email ? ` • ${selectedCustomer.email}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-gray-800">Add Customer</p>
              )}
            </div>

            {selectedCustomer ? (
              <button
                onClick={onClearCustomer}
                className="text-xs font-semibold text-amber-700 transition hover:text-amber-900"
              >
                Đổi
              </button>
            ) : (
              <span className="text-gray-400">→</span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={customerKeyword}
                onChange={(event) => onCustomerKeywordChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSearchCustomers();
                  }
                }}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-amber-700"
                placeholder="Tìm khách hàng..."
                type="text"
              />
            </div>

            <button
              onClick={onSearchCustomers}
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800"
            >
              {isSearchingCustomers ? "..." : "Tìm"}
            </button>
          </div>

          {customerResults.length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
              {customerResults.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-amber-50"
                >
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {customer.phone}
                    {customer.email ? ` • ${customer.email}` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-h-[calc(100vh-480px)] flex-1 space-y-4 overflow-y-auto p-5">
        {items.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-gray-400">
            <p className="text-sm">No items added yet</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cart_item_id}
              className="flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    {item.product?.name || item.product_name || item.product_franchise_id}
                  </p>
                  {item.selected_size_label ? (
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-700/80">
                      Size {item.selected_size_label}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-gray-500">SL: {item.quantity}</p>
                  {item.note ? (
                    <p className="mt-1 text-xs text-gray-500">{item.note}</p>
                  ) : null}
                  {item.options.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 text-xs text-gray-500">
                      {item.options.map((option) => (
                        <li key={`${item.cart_item_id}-${option.product_franchise_id}`}>
                          Topping: {option.product?.name || option.product_name} x{option.quantity}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {currency.format(item.final_line_total)}đ
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDecreaseItem(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-4 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => onAddOneMore(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-700 text-white shadow-sm transition-colors hover:bg-amber-800"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.cart_item_id)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="h-px w-full bg-gray-100" />
            </div>
          ))
        )}

        {items.length > 0 ? (
          <div className="mt-4">
            <textarea
              value={draftMessage}
              onChange={(event) => onMessageChange(event.target.value)}
              className="h-20 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
              placeholder="Add order note..."
            />
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
            Thông tin giao/checkout
          </h3>

          <div className="mt-4 space-y-2">
            <input
              value={draftAddress}
              onChange={(event) => onAddressChange(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-700"
              placeholder="Địa chỉ"
              type="text"
            />
            <input
              value={draftPhone}
              onChange={(event) => onPhoneChange(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-700"
              placeholder="Số điện thoại"
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-3 border-t border-gray-100 bg-white p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">
              {currency.format(subtotalAmount)}đ
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Khuyến mãi</span>
            <span className="font-semibold text-gray-800">
              {currency.format(cart?.promotion_discount ?? 0)}đ
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Giảm voucher</span>
            <span className="font-semibold text-gray-800">
              {currency.format(cart?.voucher_discount ?? 0)}đ
            </span>
          </div>
        </div>

        <div className="my-1 h-px w-full bg-gray-100" />

        <div className="mb-2 flex items-center justify-between text-base font-bold text-amber-800">
          <span>Total</span>
          <span>
            {currency.format(finalAmount)}đ
          </span>
        </div>

        <div className="grid gap-3">
          <button
            onClick={onSaveCartInfo}
            disabled={!cart?._id || isMutatingCart}
            className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            {isMutatingCart ? "Đang lưu..." : "Lưu thông tin cart"}
          </button>
          <button
            onClick={onCheckout}
            disabled={!canCheckout || isMutatingCart}
            className="flex w-full items-center justify-between rounded-xl bg-amber-700 px-6 py-4 font-bold text-white shadow-lg shadow-amber-700/20 transition-all hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isMutatingCart ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xử lý
              </>
            ) : (
              <>
                <span className="text-lg">Pay</span>
                <span className="text-lg">{currency.format(finalAmount)}đ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
});

export default PosCartSidebar;
