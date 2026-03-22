import { memo } from "react";
import { AlertTriangle, Loader2, ShoppingCart, X } from "lucide-react";
import type { CartDetail, CartItem } from "../../models/cart.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosExistingActiveCartModalProps {
  open: boolean;
  existingCart: CartDetail | null;
  draftItems: CartItem[];
  isSubmitting?: boolean;
  onClose: () => void;
  onUseExistingCart: () => void;
  onMergeDraftIntoCart: () => void;
}

export const PosExistingActiveCartModal = memo(({
  open,
  existingCart,
  draftItems,
  isSubmitting = false,
  onClose,
  onUseExistingCart,
  onMergeDraftIntoCart,
}: PosExistingActiveCartModalProps) => {
  if (!open || !existingCart) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <div className="shrink-0 border-b border-gray-100 px-6 pb-5 pt-6 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
                KHÁCH HÀNG ĐANG CÓ ĐƠN MỞ
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                Khách hàng này đang có đơn phục vụ
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Bạn có thể tiếp tục với đơn đang mở, hoặc thêm những món vừa chọn vào cùng đơn đó.
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-h-0 border-b border-gray-100 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                <ShoppingCart size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Đơn hiện tại #{existingCart._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">
                  {existingCart.cart_items?.length ?? 0} món • {currency.format(existingCart.final_amount)}đ
                </p>
              </div>
            </div>

            <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-1">
              {(existingCart.cart_items ?? []).map((item) => (
                <div
                  key={item.cart_item_id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-gray-900">
                        {item.product?.name || item.product_name || item.product_franchise_id}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">SL: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-amber-800">
                      {currency.format(item.final_line_total)}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col p-6 lg:p-8">
            <h3 className="text-lg font-black text-gray-900">Món vừa chọn</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Bạn đang có {draftItems.length} món mới chưa thêm vào đơn. Vui lòng chọn cách xử lý trước khi tiếp tục.
            </p>

            <div className="mt-5 max-h-[28vh] space-y-3 overflow-y-auto pr-1">
              {draftItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-gray-900">
                        {item.product?.name || item.product_name || item.product_franchise_id}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">SL: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-amber-800">
                      {currency.format(item.final_line_total)}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-3 pt-6">
              <button
                onClick={onMergeDraftIntoCart}
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-amber-700 px-4 text-sm font-bold text-white shadow-lg shadow-amber-700/20 transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Thêm vào đơn hiện tại"}
              </button>

              <button
                onClick={onUseExistingCart}
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-gray-100 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              >
                Mở đơn hiện tại
              </button>

              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full text-sm font-semibold text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                Quay lại chọn món
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PosExistingActiveCartModal;
