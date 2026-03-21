import { memo } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { PosProduct, PosProductSize, PosToppingProduct } from "../../models/menu.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosProductConfigModalProps {
  open: boolean;
  product: PosProduct | null;
  selectedSize: PosProductSize | null;
  quantity: number;
  note: string;
  totalPrice: number;
  supportsToppings: boolean;
  toppingGroups: Array<{
    categoryId: string;
    categoryName: string;
    items: PosToppingProduct[];
  }>;
  selectedToppings: Record<string, number>;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSelectSize: (productFranchiseId: string) => void;
  onNoteChange: (value: string) => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onIncreaseTopping: (productFranchiseId: string) => void;
  onDecreaseTopping: (productFranchiseId: string) => void;
}

export const PosProductConfigModal = memo(({
  open,
  product,
  selectedSize,
  quantity,
  note,
  totalPrice,
  supportsToppings,
  toppingGroups,
  selectedToppings,
  isSubmitting = false,
  onClose,
  onConfirm,
  onSelectSize,
  onNoteChange,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onIncreaseTopping,
  onDecreaseTopping,
}: PosProductConfigModalProps) => {
  if (!open || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-gray-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700/70">
                Cấu hình món
              </p>
              <h2 className="mt-1 line-clamp-1 text-2xl font-black text-gray-900">
                {product.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {product.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[1.25fr_0.9fr]">
          <div className="min-h-0 overflow-y-auto px-6 py-6">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
                Chọn size
              </h3>

              <div className="mt-4 flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  const isActive = selectedSize?.product_franchise_id === size.product_franchise_id;

                  return (
                    <button
                      key={size.product_franchise_id}
                      onClick={() => onSelectSize(size.product_franchise_id)}
                      disabled={!size.is_available}
                      type="button"
                      className={`rounded-full border px-5 py-3 text-left transition ${
                        isActive
                          ? "border-amber-700 bg-amber-700 text-white shadow-lg shadow-amber-700/15"
                          : "border-gray-200 bg-white text-gray-800 hover:border-amber-400 hover:bg-amber-50"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <span className="block text-sm font-bold">{size.size}</span>
                      <span className={`mt-1 block text-xs ${isActive ? "text-amber-50" : "text-gray-500"}`}>
                        {currency.format(size.price)}đ
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
                Topping
              </h3>

              {!supportsToppings ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                  Món này hiện không mở topping.
                </div>
              ) : toppingGroups.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                  Chưa có topping khả dụng trong chi nhánh này.
                </div>
              ) : (
                <div className="mt-4 space-y-5">
                  {toppingGroups.map((group) => (
                    <div
                      key={group.categoryId}
                      className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">{group.categoryName}</h4>
                        <span className="text-xs font-medium text-gray-400">
                          {group.items.length} lựa chọn
                        </span>
                      </div>

                      <div className="space-y-3">
                        {group.items.map((topping) => {
                          const currentQuantity = selectedToppings[topping.product_franchise_id] ?? 0;

                          return (
                            <div
                              key={topping.product_franchise_id}
                              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                                  {topping.name}
                                </p>
                                <p className="mt-1 text-xs text-amber-700">
                                  +{currency.format(topping.price)}đ
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onDecreaseTopping(topping.product_franchise_id)}
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-gray-800">
                                  {currentQuantity}
                                </span>
                                <button
                                  onClick={() => onIncreaseTopping(topping.product_franchise_id)}
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-700 text-white transition hover:bg-amber-800"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
                Ghi chú
              </h3>

              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                rows={3}
                className="mt-4 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                placeholder="Ví dụ: ít đá, giao nhanh, không bỏ ống hút..."
              />
            </section>
          </div>

          <div className="flex flex-col justify-between border-t border-gray-100 bg-gray-50/80 px-6 py-6 lg:border-l lg:border-t-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                Tạm tính món
              </p>
              <p className="mt-2 text-4xl font-black text-amber-800">
                {currency.format(totalPrice)}đ
              </p>

              {selectedSize ? (
                <div className="mt-4 rounded-2xl border border-amber-100 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Size đang chọn
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{selectedSize.size}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Giá gốc {currency.format(selectedSize.price)}đ
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3">
                <span className="text-sm font-semibold text-gray-700">Số lượng</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onDecreaseQuantity}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-lg font-black text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={onIncreaseQuantity}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700 text-white transition hover:bg-amber-800"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <button
                  onClick={onClose}
                  type="button"
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-white"
                >
                  Hủy
                </button>
                <button
                  onClick={onConfirm}
                  type="button"
                  disabled={!selectedSize || isSubmitting}
                  className="rounded-2xl bg-amber-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-amber-700/20 transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  {isSubmitting ? "Đang thêm món..." : "Thêm vào đơn"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PosProductConfigModal;
