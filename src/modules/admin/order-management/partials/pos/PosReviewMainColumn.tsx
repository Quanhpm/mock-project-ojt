import {
  ArrowLeft,
  Minus,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import type { CartItem } from "../../models/cart.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosReviewMainColumnProps {
  franchiseName?: string;
  displayItems: CartItem[];
  isMutatingCart: boolean;
  onBack: () => void;
  onEditItem: (item: CartItem) => void;
  onIncreaseItem: (item: CartItem) => void | Promise<void>;
  onDecreaseItem: (item: CartItem) => void | Promise<void>;
  onRemoveItem: (cartItemId: string) => void | Promise<void>;
  onDeleteOrder: () => void | Promise<void>;
}

export const PosReviewMainColumn = ({
  franchiseName,
  displayItems,
  isMutatingCart,
  onBack,
  onEditItem,
  onIncreaseItem,
  onDecreaseItem,
  onRemoveItem,
  onDeleteOrder,
}: PosReviewMainColumnProps) => {
  return (
    <div className="space-y-6 lg:col-span-8">
      <header>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex w-fit items-center gap-2 text-sm font-semibold text-amber-800 hover:underline"
        >
          <ArrowLeft size={16} />
          Quay lại chọn món
        </button>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-800">
          Bước 2 / Kiểm tra đơn hàng
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Xác nhận đơn hàng</h1>
      </header>

      <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-800">
              <Store size={24} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Chi nhánh</p>
              <h3 className="text-lg font-bold">{franchiseName || "Chưa có dữ liệu chi nhánh"}</h3>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-tighter">Đang hoạt động</span>
          </div>
        </div>

        <div className="space-y-8 py-4">
          {displayItems.length === 0 ? (
            <p className="py-4 text-center text-gray-500">Chưa có món nào được chọn</p>
          ) : (
            displayItems.map((item) => (
              <div
                key={item.cart_item_id}
                onClick={() => onEditItem(item)}
                className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-transparent p-3 transition hover:border-amber-200 hover:bg-amber-50/40 sm:flex-row sm:gap-6"
              >
                <div className="relative flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 ring-1 ring-black/5 sm:w-24">
                  {item.product?.image_url || item.product_image_url ? (
                    <img
                      src={item.product?.image_url || item.product_image_url}
                      alt={item.product?.name || item.product_name || "Sản phẩm"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="text-gray-300" size={32} />
                  )}
                </div>

                <div className="w-full flex-grow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 pr-2">
                      <h4 className="line-clamp-2 text-lg font-bold text-gray-900">
                        {item.product?.name || item.product_name || item.product_franchise_id}
                      </h4>
                      {item.selected_size_label ? (
                        <p className="mt-0.5 text-sm font-medium text-amber-800">
                          Size {item.selected_size_label}
                        </p>
                      ) : null}
                      {item.options && item.options.length > 0 ? (
                        <p className="mt-0.5 text-sm text-gray-500">
                          +{" "}
                          {item.options
                            .map((topping) => `${topping.product?.name || topping.product_name} (x${topping.quantity})`)
                            .join(", ")}
                        </p>
                      ) : null}
                      {item.note ? (
                        <p className="mt-0.5 text-sm italic text-gray-500">"{item.note}"</p>
                      ) : null}
                    </div>

                    <span className="whitespace-nowrap text-right text-lg font-bold text-gray-900">
                      {currency.format(item.final_line_total)}đ
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 rounded-full bg-gray-50 p-1 ring-1 ring-black/5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void onDecreaseItem(item);
                        }}
                        disabled={isMutatingCart}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void onIncreaseItem(item);
                        }}
                        disabled={isMutatingCart}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-800 text-white shadow-sm transition-colors hover:bg-amber-900 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void onRemoveItem(item.cart_item_id);
                      }}
                      disabled={isMutatingCart}
                      className="flex items-center gap-1.5 text-sm font-bold text-gray-400 transition-colors hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </div>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Nhấn vào món để chỉnh topping, ghi chú hoặc đổi size
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              void onDeleteOrder();
            }}
            disabled={isMutatingCart}
            className="text-xs font-semibold text-gray-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa giỏ hàng
          </button>
        </div>
      </section>
    </div>
  );
};
