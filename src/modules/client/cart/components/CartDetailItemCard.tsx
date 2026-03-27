import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Pencil, Plus, ShoppingCart, X } from 'lucide-react';
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

  const optionText = item.options.map((option) => `${option.productName} x${option.quantity}`).join(', ');
  const hasQuantityError = Boolean(errors.quantityInput?.message);

  const commitQty = handleSubmit((values) => {
    const normalized = Math.max(1, Math.min(999, Math.floor(Number(values.quantityInput.trim()))));
    setValue('quantityInput', String(normalized), {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    });
    onSubmitQty(item.id, normalized);
  });

  const pendingSaveBanner = (
    <div
      className="rounded-2xl border border-[var(--cf-primary)]/20 bg-[var(--cf-primary)] px-3 py-3 shadow-[0px_14px_28px_rgba(139,29,29,0.22)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold leading-4 text-white/95">
          Đã thay đổi số lượng
        </p>
        <button
          type="button"
          onClick={() => {
            void onSaveQuantityChanges();
          }}
          disabled={isSavingQuantityChanges}
          className="rounded-lg border border-white/55 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSavingQuantityChanges ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </div>
  );

  return (
    <article
      className="grid cursor-pointer grid-cols-1 gap-4 rounded-[28px] border border-[var(--cf-primary)]/10 bg-white p-4 shadow-[0px_12px_32px_rgba(28,27,27,0.05)] transition-all hover:shadow-[0px_20px_44px_rgba(28,27,27,0.09)] md:grid-cols-12 md:items-center md:gap-4 md:p-5"
      onClick={() => onEdit(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onEdit(item);
        }
      }}
    >
      <div className="col-span-1 flex gap-3 md:col-span-5 md:gap-4">
        <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-[var(--cf-primary)]/10 bg-[var(--cf-bg)] md:h-[100px] md:w-[100px] md:rounded-xl">
          {item.imageUrl ? (
            <img alt={item.name} className="h-full w-full object-cover" src={item.imageUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--cf-secondary)]">
              <ShoppingCart size={22} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight text-[var(--cf-dark)] md:text-lg">
                {item.name}
              </h3>
              <p className="mt-1 text-[11px] font-medium text-[var(--cf-primary)]/45 md:hidden">
                Chạm để chỉnh sửa món
              </p>
              {optionText && (
                <p className="mt-2 text-xs text-[var(--cf-primary)]/65">
                  Topping: {optionText}
                </p>
              )}
              {item.note && (
                <p className="mt-1 text-xs italic text-[var(--cf-primary)]/55">
                  Ghi chú: {item.note}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1 md:hidden" onClick={(event) => event.stopPropagation()}>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cf-primary)]/10 text-[var(--cf-primary)]/60 transition-all hover:bg-[var(--cf-bg)] hover:text-[var(--cf-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                disabled={isDeleting || isUpdatingQuantity}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(item);
                }}
                title="Chỉnh sửa món"
                type="button"
              >
                <Pencil size={16} />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 text-red-500 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                disabled={isDeleting}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item.id);
                }}
                title="Xóa khỏi giỏ"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <div className="rounded-2xl bg-[var(--cf-primary)]/6 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cf-primary)]/45">
                Thành tiền
              </p>
              <p className="mt-1 text-sm font-extrabold text-[var(--cf-primary)]">
                {formatCurrency(item.finalLineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden text-center font-medium text-[var(--cf-primary)]/75 md:col-span-2 md:block">
        {formatCurrency(item.unitPrice)}
      </div>

      <div className="col-span-1 flex flex-col justify-center md:col-span-2 md:items-center md:relative">
        {hasPendingQuantityChange && (
          <>
            <div className="mb-3 md:hidden">{pendingSaveBanner}</div>
            <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 md:block">
              <div className="relative w-max">
                {pendingSaveBanner}
                <div className="absolute -bottom-[7px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-x-transparent border-t-[7px] border-t-[var(--cf-primary)]" />
              </div>
            </div>
          </>
        )}

        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cf-primary)]/45 md:hidden">
          Số lượng
        </div>
        <div
          className={`inline-flex w-full items-center justify-between gap-3 rounded-full border bg-[var(--cf-bg)] px-2 py-1 md:w-auto ${hasQuantityError ? 'border-red-400 bg-red-50/40' : 'border-[var(--cf-primary)]/15'}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cf-primary)]/10 bg-white text-[var(--cf-primary)]/70 transition-all hover:text-[var(--cf-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer md:h-7 md:w-7"
            disabled={isDeleting || isUpdatingQuantity || item.quantity <= 1}
            onClick={(event) => {
              event.stopPropagation();
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
                className={`h-10 w-16 rounded-xl bg-white text-center text-base font-bold text-[var(--cf-dark)] focus:outline-none focus:ring-2 md:h-auto md:w-12 md:rounded-md md:text-sm ${hasQuantityError ? 'border border-red-400 focus:ring-red-200' : 'border border-[var(--cf-primary)]/15 focus:ring-[var(--cf-primary)]/25'}`}
                disabled={isDeleting || isUpdatingQuantity}
                inputMode="numeric"
                max={999}
                min={1}
                onBlur={() => {
                  field.onBlur();
                  void commitQty();
                }}
                onChange={field.onChange}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cf-primary)]/10 bg-white text-[var(--cf-primary)]/70 transition-all hover:text-[var(--cf-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer md:h-7 md:w-7"
            disabled={isDeleting || isUpdatingQuantity || item.quantity >= 999}
            onClick={(event) => {
              event.stopPropagation();
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
          <p className="mt-2 max-w-[170px] text-center text-[11px] font-medium leading-4 text-red-500">
            {errors.quantityInput.message}
          </p>
        )}
      </div>

      <div className="hidden pr-4 text-right text-lg font-extrabold text-[var(--cf-primary)] md:col-span-2 md:block">
        {formatCurrency(item.finalLineTotal)}
      </div>

      <div className="hidden items-center justify-center gap-2 md:col-span-1 md:flex" onClick={(event) => event.stopPropagation()}>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--cf-primary)]/45 transition-all hover:bg-[var(--cf-bg)] hover:text-[var(--cf-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          disabled={isDeleting || isUpdatingQuantity}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(item);
          }}
          title="Chỉnh sửa món"
          type="button"
        >
          <Pencil size={18} />
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--cf-primary)]/40 transition-all hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          disabled={isDeleting}
          onClick={(event) => {
            event.stopPropagation();
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
