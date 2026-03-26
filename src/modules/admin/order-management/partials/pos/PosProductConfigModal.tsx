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
  confirmLabel?: string;
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
  confirmLabel = "Thêm vào đơn",
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 px-2 py-2 backdrop-blur-sm transition-opacity sm:items-center sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-full max-w-[1100px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:h-[92vh] sm:max-h-[92vh] sm:rounded-[32px] lg:flex-row">
        {/* Left Column: Hình ảnh lớn (Chỉ hiện trên Desktop/Tablet lớn) */}
        <div className="relative hidden w-[42%] flex-col bg-gray-100 lg:flex">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
              Không có ảnh
            </div>
          )}
          {/* Gradient tạo nền tối cho chữ dễ đọc */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Thông tin món đè lên ảnh */}
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h2 className="text-3xl font-black leading-tight shadow-black/10 drop-shadow-md">
              {product.name}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm text-gray-200 shadow-black/10 drop-shadow-sm">
              {product.description}
            </p>
          </div>
        </div>

        {/* Right Column: Khu vực tùy chỉnh & Sticky Footer */}
        <div className="relative flex min-h-0 flex-1 flex-col bg-white">
          {/* Nút Đóng */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/80 text-gray-600 backdrop-blur-md transition hover:bg-gray-200 hover:text-gray-900 lg:bg-white/80"
          >
            <X size={20} />
          </button>

          {/* Header phiên bản Mobile (Ẩn trên Desktop) */}
          <div className="relative flex shrink-0 items-center gap-4 border-b border-gray-100 p-4 sm:p-5 lg:hidden">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1 pr-10">
              <h2 className="line-clamp-1 text-xl font-bold text-gray-900">{product.name}</h2>
              <p className="line-clamp-1 text-sm text-gray-500">{product.description}</p>
            </div>
          </div>

          {/* Khung cuộn nội dung cấu hình */}
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-4 pb-[144px] pt-6 sm:px-6 sm:pb-[132px] sm:pt-8 lg:px-8 lg:pb-[120px] lg:pt-10">
            <section>
              <h3 className="flex items-center gap-2 text-xl font-black text-gray-900">
                Kích cỡ <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Bắt buộc</span>
              </h3>
              
              <div className="mt-4 max-h-[180px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {product.sizes.map((size) => {
                    const isActive = selectedSize?.product_franchise_id === size.product_franchise_id;
                    return (
                      <button
                        key={size.product_franchise_id}
                        onClick={() => onSelectSize(size.product_franchise_id)}
                        disabled={!size.is_available}
                        type="button"
                        className={`relative flex min-h-[88px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 px-3 py-4 text-center transition-all ${
                          isActive
                            ? "border-amber-600 bg-amber-50/50 shadow-md"
                            : "border-gray-100 bg-white hover:border-amber-300"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <span className={`text-base font-bold ${isActive ? "text-amber-900" : "text-gray-900"}`}>
                          {size.size}
                        </span>
                        <span className={`mt-1 text-sm font-semibold ${isActive ? "text-amber-700" : "text-gray-500"}`}>
                          {currency.format(size.price)}đ
                        </span>
                        {isActive && (
                          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-bl-xl rounded-tr-xl bg-amber-600 shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-end justify-between">
                <h3 className="text-xl font-black text-gray-900">Thêm Topping</h3>
              </div>

              {!supportsToppings ? (
                <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                  Món này không hỗ trợ topping.
                </div>
              ) : toppingGroups.length === 0 ? (
                <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                  Chưa có topping khả dụng trong chi nhánh này.
                </div>
              ) : (
                <div className="mt-5 flex min-h-0 flex-1 flex-col rounded-3xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/5">
                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="space-y-6">
                      {toppingGroups.map((group) => (
                        <div key={group.categoryId}>
                          <h4 className="mb-3 px-2 text-sm font-bold uppercase tracking-wider text-gray-400">
                            {group.categoryName}
                          </h4>

                          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
                            {group.items.map((topping, index) => {
                              const currentQuantity = selectedToppings[topping.product_franchise_id] ?? 0;

                              return (
                                <div
                                  key={topping.product_franchise_id}
                                  className={`flex min-h-[76px] items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 ${
                                    index !== group.items.length - 1 ? "border-b border-gray-50" : ""
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-base font-semibold text-gray-900">{topping.name}</p>
                                    <p className="mt-0.5 text-sm font-medium text-amber-700">
                                      +{currency.format(topping.price)}đ
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-3">
                                    {currentQuantity > 0 ? (
                                      <>
                                        <button
                                          onClick={() => onDecreaseTopping(topping.product_franchise_id)}
                                          type="button"
                                          className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-800 transition hover:bg-amber-200"
                                        >
                                          <Minus size={18} />
                                        </button>
                                        <span className="w-4 text-center text-base font-black text-gray-900">
                                          {currentQuantity}
                                        </span>
                                      </>
                                    ) : null}
                                    <button
                                      onClick={() => onIncreaseTopping(topping.product_franchise_id)}
                                      type="button"
                                      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                        currentQuantity > 0
                                          ? "bg-amber-600 text-white hover:bg-amber-700"
                                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                      }`}
                                    >
                                      <Plus size={18} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </section>

            <section className="shrink-0">
              <h3 className="text-xl font-black text-gray-900">Ghi chú cho quán</h3>
              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                rows={3}
                className="mt-4 h-20 w-full resize-none rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-600/10"
                placeholder="Ví dụ: Ít đá, nhiều sữa, không lấy ống hút..."
              />
            </section>
          </div>

          {/* Sticky Footer: Phủ kính mờ bám đáy */}
          <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white/85 p-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 sm:px-8 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Cụm Số lượng */}
              <div className="flex shrink-0 items-center justify-between rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  onClick={onDecreaseQuantity}
                  type="button"
                  disabled={quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
                >
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center text-lg font-black text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={onIncreaseQuantity}
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition hover:bg-gray-100"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Nút Submit Khổng lồ bám giá trị */}
              <button
                onClick={onConfirm}
                type="button"
                disabled={!selectedSize || isSubmitting}
                className="group flex h-14 w-full flex-1 items-center justify-between rounded-2xl bg-amber-700 px-5 shadow-lg shadow-amber-700/25 transition-all hover:bg-amber-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none sm:px-6"
              >
                <span className="text-base font-bold text-white">
                  {isSubmitting ? "Đang xử lý..." : confirmLabel}
                </span>
                <span className="text-lg font-black text-amber-100 transition-colors group-hover:text-white">
                  {currency.format(totalPrice)}đ
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PosProductConfigModal;
