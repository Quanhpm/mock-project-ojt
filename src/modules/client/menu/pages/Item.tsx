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
    <div className="h-full bg-[var(--cf-bg)] px-8 py-4 flex items-center justify-center">
      <main className="w-full grid grid-cols-1 md:grid-cols-10 gap-8 items-start">
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
