import { memo } from "react";
import { Loader2, Minus, Plus, Search, Trash2, User } from "lucide-react";
import type { CartItem } from "../../models/cart.models";
import type { CustomerOption } from "../../models/customer.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosDraftSidebarProps {
  items: CartItem[];
  subtotalAmount: number;
  cartId: string | null;
  selectedCustomer: CustomerOption | null;
  customerKeyword: string;
  customerResults: CustomerOption[];
  isSearchingCustomers: boolean;
  isMutatingCart: boolean;
  onCustomerKeywordChange: (value: string) => void;
  onSearchCustomers: () => void;
  onSelectCustomer: (customer: CustomerOption) => void;
  onClearCustomer: () => void;
  onEditItem: (item: CartItem) => void;
  onAddOneMore: (item: CartItem) => void;
  onDecreaseItem: (item: CartItem) => void;
  onRemoveItem: (cartItemId: string) => void;
  canContinue: boolean;
  onContinue: () => void;
}

export const PosDraftSidebar = memo(({
  items,
  subtotalAmount,
  cartId,
  selectedCustomer,
  customerKeyword,
  customerResults,
  isSearchingCustomers,
  isMutatingCart,
  onCustomerKeywordChange,
  onSearchCustomers,
  onSelectCustomer,
  onClearCustomer,
  onEditItem,
  onAddOneMore,
  onDecreaseItem,
  onRemoveItem,
  canContinue,
  onContinue,
}: PosDraftSidebarProps) => {
  const orderLabel = cartId ? cartId.slice(-6).toUpperCase() : "NEW";
  const cartStatusLabel = cartId ? "Cart active" : "Chưa có cart";

  return (
    <aside className="z-10 flex h-full min-h-0 w-96 shrink-0 flex-col overflow-hidden border-l border-gray-100 bg-white">
      <div className="shrink-0 border-b border-gray-50 bg-white p-6 pb-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            Order #{orderLabel}
          </h2>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            {cartStatusLabel}
          </span>
        </div>

        <div className="relative mt-2">
          <div className="group flex items-center gap-4 rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5 transition-colors hover:bg-gray-100">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
              <User size={20} />
            </div>

            <div className="min-w-0 flex-1">
              {selectedCustomer ? (
                <>
                  <p className="truncate text-sm font-bold text-gray-900">{selectedCustomer.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {selectedCustomer.phone}
                    {selectedCustomer.email ? ` • ${selectedCustomer.email}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-gray-600">Thêm khách hàng</p>
              )}
            </div>

            {selectedCustomer ? (
              <button
                onClick={onClearCustomer}
                className="text-sm font-bold text-amber-700 opacity-80 transition hover:opacity-100"
              >
                Đổi
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={customerKeyword}
                onChange={(event) => onCustomerKeywordChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    onSearchCustomers();
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
              className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-800 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSearchingCustomers ? "..." : "Tìm"}
            </button>
          </div>

          {customerResults.length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-[300px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5">
              {customerResults.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
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
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-gray-50/30">
        <div className="min-h-0 flex-1 overflow-y-auto p-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center space-y-3 text-center text-gray-400">
              <div className="rounded-full bg-gray-100 p-4">
                <Loader2 size={24} className="opacity-0" />
              </div>
              <p className="text-sm font-medium">
                {selectedCustomer
                  ? "Giỏ hàng của khách hiện chưa có món nào"
                  : "Chọn khách hàng trước khi thêm món"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cart_item_id}
                  onClick={() => onEditItem(item)}
                  className="group flex cursor-pointer flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:ring-amber-300/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-base font-bold leading-tight text-gray-900">
                        {item.product?.name || item.product_name || item.product_franchise_id}
                      </p>

                      {item.selected_size_label ? (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                          <span className="h-1 w-1 rounded-full bg-amber-500" />
                          Size {item.selected_size_label}
                        </p>
                      ) : null}

                      {item.options.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs text-gray-500">
                          {item.options.map((option) => (
                            <li key={`${item.cart_item_id}-${option.product_franchise_id}`} className="flex items-start gap-1">
                              <span className="text-gray-400">+</span>
                              <span>
                                {option.product?.name || option.product_name}{" "}
                                <span className="font-semibold text-gray-700">x{option.quantity}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {item.note ? (
                        <div className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs italic text-yellow-800">
                          "{item.note}"
                        </div>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-amber-800">
                        {currency.format(item.final_line_total)}<span className="text-xs">đ</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Nhấn để chỉnh sửa
                    </span>
                    <div className="flex items-center gap-1.5 rounded-full bg-gray-50 p-1">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDecreaseItem(item);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddOneMore(item);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition hover:bg-amber-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveItem(item.cart_item_id);
                      }}
                      className="rounded-full p-2 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
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
      </div>

      <div className="shrink-0 border-t border-gray-100 bg-white p-6">
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-white px-1 py-1">
          <span className="text-[15px] font-black uppercase tracking-[0.08em] text-gray-900">
            TỔNG CỘNG
          </span>
          <span className="text-[42px] font-black leading-none tracking-tight text-amber-700">
            {currency.format(subtotalAmount)}đ
          </span>
        </div>

        <button
          onClick={onContinue}
          disabled={!canContinue || isMutatingCart}
          className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-amber-700 px-6 font-bold shadow-lg shadow-amber-700/25 transition-[transform,shadow,background] hover:bg-amber-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          <div className="flex w-full items-center justify-center text-white">
            {isMutatingCart ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <span className="text-base uppercase tracking-wider">Tiếp tục kiểm tra đơn</span>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
});

export default PosDraftSidebar;
