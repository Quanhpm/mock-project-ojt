import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ProductDetailResponse, ProductSize } from '@/apis/endpointsCLIENT/productDetail.api';
import type { ProductToppingOption } from '../hooks/use-product-detail.hook';
import { getDisplaySizeLabel } from '../services/menu-page.service';

interface ItemPurchasePanelProps {
  product: ProductDetailResponse;
  selectedSize: ProductSize | null;
  toppingOptions: ProductToppingOption[];
  selectedToppings: ProductToppingOption[];
  qty: number;
  totalPrice: number;
  isProductAvailable: boolean;
  isAddingToCart: boolean;
  onSelectSize: (size: ProductSize) => void;
  onToggleTopping: (productFranchiseId: string) => void;
  onDecreaseQty: () => void;
  onIncreaseQty: () => void;
  onQtyInputChange: (value: string) => void;
  onAddToCart: () => void;
}

function ItemPurchasePanel({
  product,
  selectedSize,
  toppingOptions,
  selectedToppings,
  qty,
  totalPrice,
  isProductAvailable,
  isAddingToCart,
  onSelectSize,
  onToggleTopping,
  onDecreaseQty,
  onIncreaseQty,
  onQtyInputChange,
  onAddToCart,
}: ItemPurchasePanelProps) {
  const [isMobileOptionsOpen, setIsMobileOptionsOpen] = useState(false);
  const availableSizes = product.sizes.filter((size) => size.is_available);
  const hasSelectableOptions = availableSizes.length > 1 || (product.is_have_topping && toppingOptions.length > 0);

  useEffect(() => {
    document.body.style.overflow = isMobileOptionsOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOptionsOpen]);

  const renderOptionSections = (mode: 'desktop' | 'mobile') => (
    <div className="space-y-4 sm:space-y-5">
      <section className="space-y-2">
        <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
          Kích cỡ
        </h3>

        {mode === 'desktop' ? (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {product.sizes.map((size) => {
              const active = selectedSize?.product_franchise_id === size.product_franchise_id;
              const displaySize = getDisplaySizeLabel(size.size);

              return (
                <button
                  key={size.product_franchise_id}
                  onClick={() => onSelectSize(size)}
                  disabled={!size.is_available}
                  className={`px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    active
                      ? 'bg-[var(--cf-primary)] text-white shadow-md'
                      : 'bg-white/60 border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-white'
                  }`}
                  type="button"
                >
                  {displaySize} - {size.price.toLocaleString()}đ
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {product.sizes.map((size) => {
              const active = selectedSize?.product_franchise_id === size.product_franchise_id;
              const displaySize = getDisplaySizeLabel(size.size);

              return (
                <label
                  key={size.product_franchise_id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                    active
                      ? 'border-[var(--cf-primary)] bg-[var(--cf-primary)]/8'
                      : 'border-[var(--cf-primary)]/15 bg-white'
                  } ${size.is_available ? 'cursor-pointer' : 'cursor-not-allowed opacity-45'}`}
                >
                  <input
                    type="radio"
                    name="mobile-size-option"
                    checked={active}
                    disabled={!size.is_available}
                    onChange={() => onSelectSize(size)}
                    className="h-4 w-4 accent-[var(--cf-primary)]"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--cf-primary)]">{displaySize}</p>
                    <p className="text-sm text-[var(--cf-primary)]/70">{size.price.toLocaleString()}đ</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </section>

      {product.is_have_topping && toppingOptions.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
            Topping
          </h3>

          {mode === 'desktop' ? (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {toppingOptions.map((topping) => {
                const active = selectedToppings.some(
                  (item) => item.product_franchise_id === topping.product_franchise_id,
                );

                return (
                  <button
                    key={topping.product_franchise_id}
                    onClick={() => onToggleTopping(topping.product_franchise_id)}
                    className={`px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--cf-primary)] text-white shadow-md'
                        : 'bg-white/60 border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-white'
                    }`}
                    type="button"
                  >
                    {topping.name} + {topping.price.toLocaleString('vi-VN')}đ
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {toppingOptions.map((topping) => {
                const active = selectedToppings.some(
                  (item) => item.product_franchise_id === topping.product_franchise_id,
                );

                return (
                  <label
                    key={topping.product_franchise_id}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                      active
                        ? 'border-[var(--cf-primary)] bg-[var(--cf-primary)]/8'
                        : 'border-[var(--cf-primary)]/15 bg-white'
                    } cursor-pointer`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => onToggleTopping(topping.product_franchise_id)}
                      className="h-4 w-4 accent-[var(--cf-primary)]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--cf-primary)]">{topping.name}</p>
                      <p className="text-sm text-[var(--cf-primary)]/70">
                        + {topping.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );

  const renderQuantityAndAction = (
    buttonLabel: string,
    onAction: () => void,
    containerClassName = '',
  ) => (
    <div className={`space-y-4 sm:space-y-6 ${containerClassName}`.trim()}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[var(--cf-primary)]/60 uppercase tracking-widest mb-1">
            Tổng cộng
          </p>
          <p className="text-3xl sm:text-4xl font-black text-[var(--cf-primary)] wrap-break-word">
            {totalPrice.toLocaleString()}đ
          </p>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start bg-white rounded-full p-1 shadow-inner border border-[var(--cf-primary)]/10">
          <button
            onClick={onDecreaseQty}
            className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[var(--cf-surface)] text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-xl cursor-pointer"
            type="button"
          >
            -
          </button>
          <input
            type="number"
            value={qty}
            onChange={(event) => onQtyInputChange(event.target.value)}
            className="w-full sm:w-16 text-center font-black text-lg text-[var(--cf-primary)] focus:outline-none bg-transparent"
          />
          <button
            onClick={onIncreaseQty}
            className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[var(--cf-surface)] text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-xl cursor-pointer"
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={onAction}
        disabled={isAddingToCart || !isProductAvailable}
        className="w-full py-4 sm:py-5 bg-[var(--cf-primary)] text-white rounded-2xl font-bold text-base sm:text-lg uppercase tracking-wider shadow-lg hover:scale-101 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        type="button"
      >
        {!isProductAvailable ? 'Sản phẩm tạm hết hàng' : isAddingToCart ? 'Đang thêm...' : buttonLabel}
      </button>
    </div>
  );

  return (
    <section className="lg:col-span-7 w-full">
      <div className="bg-[var(--cf-surface)] p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-4xl shadow-sm space-y-6 sm:space-y-8 border border-white/40">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--cf-primary)] uppercase tracking-tight wrap-break-word">
            {product.name}
          </h1>
          <p className="text-[var(--cf-primary)] italic opacity-80 text-sm sm:text-base lg:text-lg">
            {product.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[var(--cf-primary)]/70">
            <span className="font-medium">{product.category_name}</span>
            <span className="opacity-40">|</span>
            <span className="font-mono break-all">SKU: {product.SKU}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--cf-primary)]">
            {selectedSize ? selectedSize.price.toLocaleString() : 0}đ
          </div>
        </header>

        <div className="hidden lg:block">
          {renderOptionSections('desktop')}
        </div>

        <footer className="hidden lg:block">
          {renderQuantityAndAction('Thêm vào giỏ hàng', onAddToCart)}
        </footer>

        <div className="lg:hidden">
          {renderQuantityAndAction('Thêm vào giỏ hàng', hasSelectableOptions ? () => setIsMobileOptionsOpen(true) : onAddToCart)}
        </div>
      </div>

      {isMobileOptionsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng tùy chọn"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMobileOptionsOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-hidden rounded-t-[28px] bg-[var(--cf-surface)] shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--cf-primary)]/55">
                  Tùy chọn món
                </p>
                <h2 className="text-xl font-black text-[var(--cf-primary)]">
                  Chọn size và topping
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileOptionsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--cf-primary)]/15 bg-white text-[var(--cf-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {renderOptionSections('mobile')}
            </div>

            {renderQuantityAndAction(
              'Thêm vào giỏ hàng',
              onAddToCart,
              'border-t border-[var(--cf-primary)]/10 bg-[var(--cf-surface)] px-4 pb-6 pt-4',
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ItemPurchasePanel;
