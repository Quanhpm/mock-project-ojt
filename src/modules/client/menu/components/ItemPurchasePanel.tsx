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
  isAddingToCart,
  onSelectSize,
  onToggleTopping,
  onDecreaseQty,
  onIncreaseQty,
  onQtyInputChange,
  onAddToCart,
}: ItemPurchasePanelProps) {
  return (
    <section className="md:col-span-7 w-full">
      <div className="bg-[var(--cf-surface)] p-8 rounded-[2rem] shadow-sm space-y-8 border border-white/40">
        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--cf-primary)] uppercase tracking-tight">
            {product.name}
          </h1>
          <p className="text-[var(--cf-primary)] italic opacity-80 text-lg">
            {product.description}
          </p>
          <div className="flex items-center gap-3 text-sm text-[var(--cf-primary)]/70">
            <span className="font-medium">{product.category_name}</span>
            <span className="opacity-40">|</span>
            <span className="font-mono">SKU: {product.SKU}</span>
          </div>
          <div className="text-3xl font-black text-[var(--cf-primary)]">
            {selectedSize ? selectedSize.price.toLocaleString() : 0}đ
          </div>
        </header>

        <div className="space-y-5">
          <section className="space-y-2">
            <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
              Kích cỡ
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => {
                const active = selectedSize?.product_franchise_id === size.product_franchise_id;
                const displaySize = getDisplaySizeLabel(size.size);

                return (
                  <button
                    key={size.product_franchise_id}
                    onClick={() => onSelectSize(size)}
                    disabled={!size.is_available}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${active
                      ? 'bg-[var(--cf-primary)] text-white shadow-md'
                      : 'bg-white/60 border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-white'
                      }`}
                    type="button"
                  >
                    {displaySize} — {size.price.toLocaleString()}đ
                  </button>
                );
              })}
            </div>
          </section>

          {product.is_have_topping && toppingOptions.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                Topping
              </h3>
              <div className="flex flex-wrap gap-3">
                {toppingOptions.map((topping) => {
                  const active = selectedToppings.some((item) => item.product_franchise_id === topping.product_franchise_id);

                  return (
                    <button
                      key={topping.product_franchise_id}
                      onClick={() => onToggleTopping(topping.product_franchise_id)}
                      className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer ${active
                        ? 'bg-[var(--cf-primary)] text-white shadow-md'
                        : 'bg-white/60 border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-white'
                        }`}
                      type="button"
                    >
                      {topping.name} + {topping.price.toLocaleString('vi-VN')}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <footer className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[var(--cf-primary)]/60 uppercase tracking-widest mb-1">
                Tổng cộng
              </p>
              <p className="text-4xl font-black text-[var(--cf-primary)]">
                {totalPrice.toLocaleString()}đ
              </p>
            </div>

            <div className="flex items-center bg-white rounded-full p-1 shadow-inner border border-[var(--cf-primary)]/10">
              <button
                onClick={onDecreaseQty}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--cf-surface)] text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-xl cursor-pointer"
                type="button"
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => onQtyInputChange(e.target.value)}
                className="w-16 text-center font-black text-lg text-[var(--cf-primary)] focus:outline-none"
              />
              <button
                onClick={onIncreaseQty}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--cf-surface)] text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-xl cursor-pointer"
                type="button"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isAddingToCart}
            className="w-full py-5 bg-[var(--cf-primary)] text-white rounded-2xl font-bold text-lg uppercase tracking-wider shadow-lg hover:scale-101 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
          >
            {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
          </button>
        </footer>
      </div>
    </section>
  );
}

export default ItemPurchasePanel;
