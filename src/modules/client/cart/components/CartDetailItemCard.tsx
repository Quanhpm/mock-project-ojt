import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Pencil, Plus, ShoppingBag, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CartDetailItemView } from '../hooks/cartApiMapper';

const rowQuantitySchema = z.object({
  quantityInput: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số lượng.')
    .regex(/^\d+$/, 'Số lượng chỉ được nhập số nguyên dương.')
    .refine((value) => {
      const parsed = Number(value);
      return parsed >= 1 && parsed <= 999;
    }, 'Số lượng hợp lệ từ 1 đến 999.'),
});

type RowQuantityFormValues = z.infer<typeof rowQuantitySchema>;

interface CartDetailItemCardProps {
  item: CartDetailItemView;
  isDeleting: boolean;
  isUpdatingQuantity: boolean;
  isSavingQuantityChanges: boolean;
  hasPendingQuantityChange: boolean;
  onDelete: (itemId: string) => void;
  onEdit: (item: CartDetailItemView) => void;
  onDecreaseQty: (itemId: string) => void;
  onIncreaseQty: (itemId: string) => void;
  onSubmitQty: (itemId: string, nextQty: number) => void;
  onSaveQuantityChanges: () => void | Promise<boolean>;
  formatCurrency: (amount: number) => string;
}

function CartDetailItemCard({
  item,
  isDeleting,
  isUpdatingQuantity,
  isSavingQuantityChanges,
  hasPendingQuantityChange,
  onDelete,
  onEdit,
  onDecreaseQty,
  onIncreaseQty,
  onSubmitQty,
  onSaveQuantityChanges,
  formatCurrency,
}: CartDetailItemCardProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RowQuantityFormValues>({
    resolver: zodResolver(rowQuantitySchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      quantityInput: String(item.quantity),
    },
  });

  useEffect(() => {
    setValue('quantityInput', String(item.quantity), {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [item.quantity, setValue]);

  const optionText = item.options.map((o) => `${o.productName} x${o.quantity}`).join(', ');
  const hasQuantityError = Boolean(errors.quantityInput?.message);

  const commitQty = handleSubmit(
    (values) => {
      const normalized = Math.max(1, Math.min(999, Math.floor(Number(values.quantityInput.trim()))));
      setValue('quantityInput', String(normalized), {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      });
      onSubmitQty(item.id, normalized);
    },
  );

  return (
    <article
      className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(28,27,27,0.05)] border border-[var(--cf-primary)]/10 p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:shadow-[0px_20px_44px_rgba(28,27,27,0.09)] transition-all cursor-pointer"
      key={item.id}
      onClick={() => onEdit(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(item);
        }
      }}
    >
      <div className="col-span-1 md:col-span-5 flex gap-4">
        <div className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-xl overflow-hidden bg-[var(--cf-bg)] border border-[var(--cf-primary)]/10 flex-shrink-0">
          {item.imageUrl ? (
            <img alt={item.name} className="w-full h-full object-cover" src={item.imageUrl} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--cf-secondary)]">
              <ShoppingBag size={22} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="font-bold text-lg leading-tight text-[var(--cf-dark)]">{item.name}</h3>
          {optionText && (
            <p className="text-xs text-[var(--cf-primary)]/65 mt-1">Topping: {optionText}</p>
          )}
          {item.note && (
            <p className="text-xs text-[var(--cf-primary)]/55 mt-1 italic">Ghi chú: {item.note}</p>
          )}
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 text-center text-[var(--cf-primary)]/75 font-medium">
        <span className="md:hidden text-xs text-[var(--cf-primary)]/50 block uppercase tracking-wider">Giá:</span>
        {formatCurrency(item.unitPrice)}
      </div>

      <div className="col-span-1 md:col-span-2 flex flex-col justify-center items-center relative">
        {hasPendingQuantityChange && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-max rounded-xl border border-[var(--cf-dark)]/25 bg-[var(--cf-primary)] px-3 py-2.5 shadow-[0px_14px_28px_rgba(139,29,29,0.22)]">
              <div className="flex items-center gap-2">
                <p className="text-[11px] leading-4 font-semibold text-white/95 whitespace-nowrap">
                  Đã thay đổi số lượng
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void onSaveQuantityChanges();
                  }}
                  disabled={isSavingQuantityChanges}
                  className="px-2.5 py-1 rounded-md border border-white/55 bg-[var(--cf-bg)]/10 text-[11px] font-bold text-white whitespace-nowrap hover:bg-[var(--cf-bg)]/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingQuantityChanges ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-0 h-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-[var(--cf-primary)]" />
            </div>
          </div>
        )}

        <div
          className={`inline-flex items-center bg-[var(--cf-bg)] rounded-full px-2 py-1 gap-3 border ${hasQuantityError ? 'border-red-400 bg-red-50/40' : 'border-[var(--cf-primary)]/15'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-7 h-7 rounded-full bg-white border border-[var(--cf-primary)]/10 text-[var(--cf-primary)]/70 hover:text-[var(--cf-primary)] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            disabled={isDeleting || isUpdatingQuantity || item.quantity <= 1}
            onClick={(e) => {
              e.stopPropagation();
              onDecreaseQty(item.id);
              setValue('quantityInput', String(Math.max(1, item.quantity - 1)), {
                shouldValidate: false,
                shouldDirty: false,
                shouldTouch: false,
              });
            }}
            type="button"
          >
            <Minus size={13} />
          </button>
          <Controller
            control={control}
            name="quantityInput"
            render={({ field }) => (
              <input
                className={`w-12 bg-white rounded-md text-sm font-bold text-center text-[var(--cf-dark)] focus:outline-none focus:ring-2 ${hasQuantityError ? 'border border-red-400 focus:ring-red-200' : 'border border-[var(--cf-primary)]/15 focus:ring-[var(--cf-primary)]/25'}`}
                disabled={isDeleting || isUpdatingQuantity}
                inputMode="numeric"
                max={999}
                min={1}
                onBlur={() => {
                  field.onBlur();
                  void commitQty();
                }}
                onChange={field.onChange}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    void commitQty();
                  }
                }}
                pattern="[0-9]*"
                ref={field.ref}
                type="text"
                value={field.value}
              />
            )}
          />
          <button
            className="w-7 h-7 rounded-full bg-white border border-[var(--cf-primary)]/10 text-[var(--cf-primary)]/70 hover:text-[var(--cf-primary)] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            disabled={isDeleting || isUpdatingQuantity || item.quantity >= 999}
            onClick={(e) => {
              e.stopPropagation();
              onIncreaseQty(item.id);
              setValue('quantityInput', String(Math.min(999, item.quantity + 1)), {
                shouldValidate: false,
                shouldDirty: false,
                shouldTouch: false,
              });
            }}
            type="button"
          >
            <Plus size={13} />
          </button>
        </div>
        {errors.quantityInput?.message && (
          <p className="mt-2 text-[11px] text-red-500 font-medium text-center max-w-[170px] leading-4">{errors.quantityInput.message}</p>
        )}
      </div>

      <div className="col-span-1 md:col-span-2 text-right pr-0 md:pr-4 font-extrabold text-[var(--cf-primary)] text-lg">
        <span className="md:hidden text-xs text-[var(--cf-primary)]/50 block uppercase tracking-wider">Thành tiền:</span>
        {formatCurrency(item.finalLineTotal)}
      </div>

      <div className="col-span-1 flex justify-end md:justify-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--cf-primary)]/45 hover:bg-[var(--cf-bg)] hover:text-[var(--cf-primary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={isDeleting || isUpdatingQuantity}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          title="Chỉnh sửa món"
          type="button"
        >
          <Pencil size={18} />
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--cf-primary)]/40 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={isDeleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="Xóa khỏi giỏ"
          type="button"
        >
          <X size={18} />
        </button>
      </div>
    </article>
  );
}

export default CartDetailItemCard;

