import { useMemo } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import type { CartDetailItemView } from '../hook/cartApiMapper';

interface CartEditModalProps {
  editingItem: CartDetailItemView | null;
  editItemQuantity: number;
  editNote: string;
  editOptions: Record<string, number>;
  isSavingEdit: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeItemQty: (nextQty: number) => void;
  onChangeItemQtyInput: (rawValue: string) => void;
  onChangeOptionQty: (optionId: string, rawValue: string) => void;
  onChangeNote: (note: string) => void;
  formatCurrency: (amount: number) => string;
}

function CartEditModal({
  editingItem,
  editItemQuantity,
  editNote,
  editOptions,
  isSavingEdit,
  onClose,
  onSave,
  onChangeItemQty,
  onChangeItemQtyInput,
  onChangeOptionQty,
  onChangeNote,
  formatCurrency,
}: CartEditModalProps) {
  const popupItemTotal = useMemo(() => {
    if (!editingItem) return 0;

    const toppingAmount = editingItem.options.reduce((sum, topping) => {
      const qty = Math.max(0, Math.min(999, Number(editOptions[topping.productFranchiseId] ?? 0)));
      return sum + topping.priceSnapshot * qty;
    }, 0);

    return (editingItem.unitPrice + toppingAmount) * editItemQuantity;
  }, [editItemQuantity, editOptions, editingItem]);

  if (!editingItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-[var(--cf-primary)]/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--cf-primary)]/10">
          <h3 className="text-xl font-bold text-[var(--cf-dark)]">Chỉnh sửa món</h3>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--cf-primary)]/60 hover:bg-[var(--cf-bg)] disabled:opacity-40 cursor-pointer"
            disabled={isSavingEdit}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <section className="p-6 flex flex-col md:flex-row gap-5 border-b border-[var(--cf-primary)]/10">
            <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden bg-[var(--cf-bg)] border border-[var(--cf-primary)]/10">
              {editingItem.imageUrl ? (
                <img alt={editingItem.name} className="w-full h-full object-cover" src={editingItem.imageUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--cf-secondary)]">
                  <ShoppingBag size={32} />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-2xl font-extrabold text-[var(--cf-dark)]">{editingItem.name}</h4>
              <p className="text-lg font-semibold text-[var(--cf-primary)] mt-1">{formatCurrency(editingItem.unitPrice)}</p>
              {editingItem.options.length > 0 && (
                <p className="text-sm text-[var(--cf-primary)]/70 mt-2 italic leading-relaxed">
                  Topping hiện tại: {editingItem.options.map((o) => `${o.productName} x${o.quantity}`).join(', ')}
                </p>
              )}
            </div>
          </section>

          <section className="px-6 py-5 space-y-7">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--cf-primary)]/70 mb-3">Số lượng</h4>
              <div className="flex items-center gap-5">
                <button
                  className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-[var(--cf-primary)]/20 text-[var(--cf-primary)] hover:border-[var(--cf-primary)] hover:text-[var(--cf-dark)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isSavingEdit || editItemQuantity <= 1}
                  onClick={() => onChangeItemQty(editItemQuantity - 1)}
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-bold min-w-8 text-center text-[var(--cf-dark)]">{editItemQuantity}</span>
                <button
                  className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-[var(--cf-primary)] bg-[var(--cf-primary)]/10 text-[var(--cf-primary)] hover:bg-[var(--cf-primary)]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isSavingEdit || editItemQuantity >= 999}
                  onClick={() => onChangeItemQty(editItemQuantity + 1)}
                >
                  <Plus size={20} />
                </button>
                <input
                  className="w-24 rounded-xl border border-[var(--cf-primary)]/20 px-3 py-2 text-center text-sm font-semibold text-[var(--cf-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/25"
                  max={999}
                  min={1}
                  onChange={(e) => onChangeItemQtyInput(e.target.value)}
                  type="number"
                  value={editItemQuantity}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--cf-primary)]/70 mb-3">Topping</h4>
              <div className="space-y-2">
                {editingItem.options.length > 0 ? editingItem.options.map((option) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--cf-primary)]/15 px-4 py-3"
                    key={`${editingItem.id}-${option.productFranchiseId}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--cf-dark)]">{option.productName}</p>
                      <p className="text-xs text-[var(--cf-primary)]/70">+ {formatCurrency(option.priceSnapshot)}</p>
                    </div>

                    <input
                      className="w-20 rounded-md border border-[var(--cf-primary)]/20 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/25"
                      max={999}
                      min={0}
                      onChange={(e) => onChangeOptionQty(option.productFranchiseId, e.target.value)}
                      type="number"
                      value={editOptions[option.productFranchiseId] ?? 0}
                    />
                  </div>
                )) : (
                  <p className="text-sm text-[var(--cf-primary)]/60 italic">Món này chưa có topping.</p>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--cf-primary)]/60">Chỉ hỗ trợ chỉnh số lượng topping đã có sẵn. Nhập 0 để xóa topping.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--cf-primary)]/70 mb-3">Ghi chú riêng</h4>
              <textarea
                className="w-full rounded-xl border border-[var(--cf-primary)]/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/25"
                id="item-note"
                onChange={(e) => onChangeNote(e.target.value)}
                placeholder="Ví dụ: ít đá, ít ngọt..."
                rows={3}
                value={editNote}
              />
            </div>
          </section>
        </div>

        <div className="px-6 py-5 border-t border-[var(--cf-primary)]/10 bg-[var(--cf-bg)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-widest font-bold text-[var(--cf-primary)]/60">Tạm tính món này</p>
            <p className="text-3xl font-extrabold text-[var(--cf-dark)]">{formatCurrency(popupItemTotal)}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-[var(--cf-primary)] hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
              disabled={isSavingEdit}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold bg-[var(--cf-primary)] text-white hover:bg-[var(--cf-dark)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              disabled={isSavingEdit}
              onClick={onSave}
            >
              {isSavingEdit ? 'Đang lưu...' : 'Cập nhật món'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartEditModal;
