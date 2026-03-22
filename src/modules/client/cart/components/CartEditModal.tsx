import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CartDetailItemView } from '../hooks/cartApiMapper';

const quantityFormSchema = z.object({
  quantityInput: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số lượng.')
    .regex(/^\d+$/, 'Số lượng phải là số nguyên dương.')
    .refine((value) => {
      const numberValue = Number(value);
      return numberValue >= 1 && numberValue <= 999;
    }, 'Số lượng phải nằm trong khoảng từ 1 đến 999.'),
});

type QuantityFormValues = z.infer<typeof quantityFormSchema>;

interface CartEditModalProps {
  editingItem: CartDetailItemView | null;
  editItemQuantity: number;
  editNote: string;
  editOptions: Record<string, number>;
  availableToppings: Array<{
    productFranchiseId: string;
    productName: string;
    priceSnapshot: number;
  }>;
  isLoadingToppings: boolean;
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
  availableToppings,
  isLoadingToppings,
  isSavingEdit,
  onClose,
  onSave,
  onChangeItemQty,
  onChangeItemQtyInput,
  onChangeOptionQty,
  onChangeNote,
  formatCurrency,
}: CartEditModalProps) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<QuantityFormValues>({
    resolver: zodResolver(quantityFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      quantityInput: String(editItemQuantity),
    },
  });

  useEffect(() => {
    setValue('quantityInput', String(editItemQuantity), {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [editItemQuantity, setValue]);

  const mergedToppings = useMemo(() => {
    if (!editingItem) return [];

    const existingMap = new Map(
      editingItem.options.map((option) => [option.productFranchiseId, option]),
    );
    const availableMap = new Map(
      availableToppings.map((option) => [option.productFranchiseId, option]),
    );

    const ids = new Set<string>([
      ...editingItem.options.map((option) => option.productFranchiseId),
      ...availableToppings.map((option) => option.productFranchiseId),
    ]);

    return Array.from(ids).map((id) => {
      const existing = existingMap.get(id);
      const available = availableMap.get(id);

      return {
        productFranchiseId: id,
        productName: existing?.productName ?? available?.productName ?? 'Topping',
        priceSnapshot: existing?.priceSnapshot ?? available?.priceSnapshot ?? 0,
      };
    });
  }, [availableToppings, editingItem]);

  const popupItemTotal = useMemo(() => {
    if (!editingItem) return 0;

    const toppingAmount = mergedToppings.reduce((sum, topping) => {
      const qty = Math.max(0, Math.min(999, Number(editOptions[topping.productFranchiseId] ?? 0)));
      return sum + topping.priceSnapshot * qty;
    }, 0);

    return (editingItem.unitPrice + toppingAmount) * editItemQuantity;
  }, [editItemQuantity, editOptions, editingItem, mergedToppings]);

  if (!editingItem) return null;

  const applyQuantityInput = handleSubmit((values) => {
    onChangeItemQtyInput(values.quantityInput.trim());
  });

  const handleSaveClick = async () => {
    const isValid = await trigger('quantityInput');
    if (!isValid) return;

    const quantityValue = getValues('quantityInput').trim();
    onChangeItemQtyInput(quantityValue);
    onSave();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,27,27,0.4)] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] max-h-[92vh] overflow-hidden rounded-xl bg-white shadow-[0px_20px_40px_rgba(28,27,27,0.08)] border border-[var(--cf-primary)]/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--cf-dark)]">{editingItem.name}</h3>
            <p className="text-sm font-medium text-[var(--cf-primary)]/65">Tùy chỉnh món trong giỏ hàng</p>
          </div>
          <button
            className="p-2 rounded-full text-[var(--cf-primary)]/65 hover:bg-[var(--cf-bg)] transition-colors disabled:opacity-40 cursor-pointer"
            disabled={isSavingEdit}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-8 pb-8 flex-1 space-y-8 overflow-hidden">
          <section className="bg-[var(--cf-bg)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-[var(--cf-primary)]/10 shrink-0">
              {editingItem.imageUrl ? (
                <img alt={editingItem.name} className="w-full h-full object-cover" src={editingItem.imageUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--cf-secondary)]">
                  <ShoppingBag size={32} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-bold text-[var(--cf-dark)]">Món đã chọn</h4>
                <span className="text-[var(--cf-primary)] font-bold">{formatCurrency(editingItem.unitPrice)}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--cf-primary)]/65">Sản phẩm có thể tùy chỉnh thêm topping</p>
            </div>
          </section>

          <section className="flex flex-col items-center justify-center gap-4 py-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cf-primary)]/65">Chỉnh số lượng</p>
            <div className="flex items-center gap-8">
              <button
                className="w-12 h-12 rounded-full border border-[var(--cf-primary)]/25 text-[var(--cf-primary)] hover:bg-[var(--cf-bg)] flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                disabled={isSavingEdit || editItemQuantity <= 1}
                onClick={() => {
                  const nextQty = editItemQuantity - 1;
                  onChangeItemQty(nextQty);
                  setValue('quantityInput', String(nextQty), {
                    shouldValidate: false,
                    shouldDirty: true,
                    shouldTouch: false,
                  });
                }}
              >
                <Minus size={20} />
              </button>
              <Controller
                control={control}
                name="quantityInput"
                render={({ field }) => (
                  <input
                    className="w-16 bg-transparent text-center text-4xl font-extrabold text-[var(--cf-dark)] border-none focus:ring-0 p-0"
                    max={999}
                    min={1}
                    onBlur={() => {
                      field.onBlur();
                      void applyQuantityInput();
                    }}
                    onChange={field.onChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void applyQuantityInput();
                      }
                    }}
                    ref={field.ref}
                    type="text"
                    value={field.value}
                  />
                )}
              />
              <button
                className="w-12 h-12 rounded-full bg-[var(--cf-primary)] text-white shadow-lg hover:bg-[var(--cf-dark)] flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                disabled={isSavingEdit || editItemQuantity >= 999}
                onClick={() => {
                  const nextQty = editItemQuantity + 1;
                  onChangeItemQty(nextQty);
                  setValue('quantityInput', String(nextQty), {
                    shouldValidate: false,
                    shouldDirty: true,
                    shouldTouch: false,
                  });
                }}
              >
                <Plus size={20} />
              </button>
            </div>
            {errors.quantityInput?.message && (
              <p className="text-xs text-red-500 font-medium">{errors.quantityInput.message}</p>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-[var(--cf-dark)]">Topping</h4>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--cf-primary)] px-3 py-1 rounded-full bg-[var(--cf-primary)]/8">
                Tùy chọn
              </span>
            </div>

            <div
              className="space-y-2 max-h-60 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {isLoadingToppings && (
                <p className="text-sm text-[var(--cf-primary)]/65 italic py-2">Đang tải danh sách topping...</p>
              )}
              {!isLoadingToppings && mergedToppings.length > 0 ? mergedToppings.map((option) => {
                const currentQty = Math.max(0, Math.min(999, Number(editOptions[option.productFranchiseId] ?? 0)));

                return (
                  <div
                    className="flex items-center justify-between py-3.5 px-4 -mx-4 rounded-lg hover:bg-[var(--cf-bg)] transition-colors"
                    key={`${editingItem.id}-${option.productFranchiseId}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--cf-dark)]">{option.productName}</span>
                      <span className="text-sm text-[var(--cf-primary)]/75">+ {formatCurrency(option.priceSnapshot)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        className="w-8 h-8 rounded-full border border-[var(--cf-primary)]/25 text-[var(--cf-primary)]/70 hover:text-[var(--cf-primary)] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        disabled={isSavingEdit || currentQty <= 0}
                        onClick={() => onChangeOptionQty(option.productFranchiseId, String(currentQty - 1))}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-[var(--cf-dark)] w-5 text-center">{currentQty}</span>
                      <button
                        className="w-8 h-8 rounded-full border border-[var(--cf-primary)]/25 text-[var(--cf-primary)]/70 hover:text-[var(--cf-primary)] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        disabled={isSavingEdit || currentQty >= 999}
                        onClick={() => onChangeOptionQty(option.productFranchiseId, String(currentQty + 1))}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                !isLoadingToppings && <p className="text-sm text-[var(--cf-primary)]/60 italic py-2">Không có topping khả dụng cho món này.</p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-[var(--cf-dark)]">Ghi chú cho quán</h4>
            <textarea
              className="w-full rounded-lg bg-[var(--cf-bg)] border-none focus:ring-2 focus:ring-[var(--cf-primary)]/20 placeholder:text-[var(--cf-primary)]/45 text-[var(--cf-dark)] py-4 px-5 text-sm resize-none"
              id="item-note"
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="Ví dụ: ít đá, nhiều sữa, không đường..."
              rows={3}
              value={editNote}
            />
          </section>
        </div>

        <div className="px-8 py-6 bg-[var(--cf-bg)] flex items-center justify-between gap-4 border-t border-[var(--cf-primary)]/10">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cf-primary)]/65">Tổng cộng</span>
            <span className="text-2xl font-extrabold tracking-tight text-[var(--cf-primary)]">{formatCurrency(popupItemTotal)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-6 py-3 rounded-full border border-[var(--cf-primary)]/25 text-[var(--cf-dark)] font-semibold hover:bg-[var(--cf-bg)] transition-all disabled:opacity-40 cursor-pointer"
              disabled={isSavingEdit}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="px-8 py-3 rounded-full bg-[var(--cf-primary)] text-white font-bold shadow-[0_10px_20px_rgba(106,1,9,0.2)] hover:bg-[var(--cf-dark)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              disabled={isSavingEdit}
              onClick={handleSaveClick}
            >
              {isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartEditModal;

