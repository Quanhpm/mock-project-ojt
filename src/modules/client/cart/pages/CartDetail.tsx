import {
  CartDetailDialogs,
  CartDetailEmptyState,
  CartDetailHeader,
  CartDetailItemsSection,
  CartDetailSummaryAside,
} from '../components';
import { useCartDetailPage } from '../hooks/use-cart-detail-page.hook';

// --- CartDetail Page ---

function CartDetail() {
  const vm = useCartDetailPage();

  if (vm.isLoading) {
    return <div className="min-h-[calc(100vh-4rem)] bg-white" />;
  }

  if (!vm.cart) {
    return <CartDetailEmptyState onBack={vm.goToCartList} />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] text-[var(--cf-dark)] bg-gradient-to-b from-[var(--cf-bg)] via-[var(--cf-bg)] to-white">
      <main className="container mx-auto px-4 md:px-6 pb-20 pt-8 md:pt-10">
        <CartDetailHeader
          itemCount={vm.cart.items.length}
          isCancellingCart={vm.isCancellingCart}
          onBack={vm.goToCartList}
          onOpenCancelCartConfirm={vm.openCancelCartConfirm}
        />

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <CartDetailItemsSection
            items={vm.cart.items}
            isDeleting={vm.isDeleting}
            isUpdatingQuantity={vm.isUpdatingQuantity}
            pendingQuantityChanges={vm.pendingQuantityChanges}
            isSavingQuantityChanges={vm.isSavingQuantityChanges}
            onDelete={vm.openDeleteConfirm}
            onEdit={vm.openEditPopup}
            onDecreaseQty={vm.decreaseCartItemQuantity}
            onIncreaseQty={vm.increaseCartItemQuantity}
            onSubmitQty={vm.setCartItemQuantity}
            onSaveQuantityChanges={vm.savePendingQuantityChanges}
            onContinueShopping={vm.goToMenu}
            formatCurrency={vm.formatCurrency}
          />

          <CartDetailSummaryAside
            subtotalAmount={vm.cart.subtotalAmount}
            voucherDiscount={vm.cart.voucherDiscount}
            finalAmount={vm.cart.finalAmount}
            totalDiscount={vm.totalDiscount}
            voucherCode={vm.voucherCode}
            isApplyingVoucher={vm.isApplyingVoucher}
            isRemovingVoucher={vm.isRemovingVoucher}
            onChangeVoucherCode={vm.setVoucherCode}
            onApplyVoucher={vm.applyVoucherForCart}
            onRemoveVouchers={vm.removeAllVoucherFromCart}
            onCheckout={vm.handleCheckout}
            getCheckoutPrefill={vm.getCheckoutPrefill}
            formatCurrency={vm.formatCurrency}
          />
        </div>
      </main>

      <CartDetailDialogs
        editItemQuantity={vm.editItemQuantity}
        editNote={vm.editNote}
        editOptions={vm.editOptions}
        availableToppings={vm.availableToppings}
        editingItem={vm.editingItem}
        formatCurrency={vm.formatCurrency}
        isLoadingToppings={vm.isLoadingToppings}
        isSavingEdit={vm.isSavingEdit}
        onChangeItemQty={vm.updateEditItemQty}
        onChangeItemQtyInput={vm.updateEditQtyFromInput}
        onChangeNote={vm.setEditNote}
        onChangeOptionQty={vm.updateOptionQtyInPopup}
        onCloseEditModal={vm.closeEditPopup}
        onSaveEditModal={vm.saveEditedItem}
        isDeleteItemConfirmOpen={Boolean(vm.pendingDeleteItemId)}
        onCloseDeleteItemConfirm={vm.closeDeleteConfirm}
        onConfirmDeleteItem={vm.confirmDeleteItem}
        isCancelCartConfirmOpen={vm.isCancelCartConfirmOpen}
        isCancellingCart={vm.isCancellingCart}
        onCloseCancelCartConfirm={vm.closeCancelCartConfirm}
        onConfirmCancelCart={() => {
          void vm.confirmCancelCart();
        }}
      />
    </div>
  );
}

export default CartDetail;

