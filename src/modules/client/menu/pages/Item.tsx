import { ArrowLeft } from 'lucide-react';
import { ItemImageGallery, ItemPurchasePanel } from '../components';
import { useItemPage } from '../hooks/use-item-page.hook';

function Item() {
  const vm = useItemPage();

  if (vm.loading) {
    return (
      <div className="p-10 text-center font-medium text-[var(--cf-primary)]">
        Đang tải...
      </div>
    );
  }

  if (!vm.product) {
    return (
      <div className="p-10 text-center font-medium text-[var(--cf-primary)]">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--cf-bg)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-start justify-center">
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-10 gap-5 sm:gap-6 lg:gap-8 items-start">
        <div className="lg:hidden lg:col-span-10">
          <button
            onClick={vm.goBack}
            type="button"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--cf-primary)]/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--cf-primary)] shadow-[0px_10px_24px_rgba(28,27,27,0.05)] transition-colors hover:bg-[var(--cf-bg)] cursor-pointer"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Trở về
          </button>
        </div>

        {/* Product image gallery */}
        <ItemImageGallery
          productName={vm.product.name}
          images={vm.images}
          activeImg={vm.activeImg}
          onSelectImage={vm.setActiveImg}
          onPrevious={() => vm.setActiveImg((vm.activeImg - 1 + vm.images.length) % vm.images.length)}
          onNext={() => vm.setActiveImg((vm.activeImg + 1) % vm.images.length)}
        />

        {/* Product details and purchase panel */}
        <ItemPurchasePanel
          product={vm.product}
          selectedSize={vm.selectedSize}
          toppingOptions={vm.toppingOptions}
          selectedToppings={vm.selectedToppings}
          qty={vm.qty}
          totalPrice={vm.totalPrice}
          isProductAvailable={vm.isProductAvailable}
          isAddingToCart={vm.isAddingToCart}
          onSelectSize={vm.setSelectedSize}
          onToggleTopping={vm.toggleTopping}
          onDecreaseQty={vm.decreaseQty}
          onIncreaseQty={vm.increaseQty}
          onQtyInputChange={vm.updateQtyFromInput}
          onAddToCart={vm.handleAddToCart}
        />
      </main>
    </div>
  );
}

export default Item;
