import { useCallback, useState } from "react";
import { PosCancelCartModal } from "../partials/pos/PosCancelCartModal";
import { PosReviewCheckoutModal } from "../partials/pos/PosReviewCheckoutModal";
import { PosProductConfigModal } from "../partials/pos/PosProductConfigModal";
import { PosReviewEmptyState } from "../partials/pos/PosReviewEmptyState";
import { PosReviewMainColumn } from "../partials/pos/PosReviewMainColumn";
import { PosReviewMobileNav } from "../partials/pos/PosReviewMobileNav";
import { PosReviewSummarySidebar } from "../partials/pos/PosReviewSummarySidebar";
import { useOrderPosReviewPage } from "../hooks/use-order-pos-review-page";

export const OrderPosReviewPage = () => {
  const {
    cart,
    resolvedCustomer,
    displayItems,
    draftAddress,
    draftPhone,
    draftMessage,
    voucherCode,
    isLoadingCart,
    isMutatingCart,
    canCheckout,
    canApplyVoucher,
    isCancelOrderModalOpen,
    isProductConfiguratorOpen,
    productBeingConfigured,
    configuredSize,
    configuredQuantity,
    configuredNote,
    supportsToppings,
    toppingGroups,
    selectedToppings,
    configuredTotalPrice,
    setVoucherCode,
    editCartItem,
    closeProductConfigurator,
    saveEditedCartItem,
    setConfiguredSize,
    setConfiguredNote,
    increaseConfiguredQuantity,
    decreaseConfiguredQuantity,
    increaseConfiguredToppingQuantity,
    decreaseConfiguredToppingQuantity,
    applyVoucher,
    removeVoucher,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
    checkoutCart,
    openCancelCurrentOrderModal,
    closeCancelCurrentOrderModal,
    confirmCancelCurrentOrder,
    goBackToBuilder,
  } = useOrderPosReviewPage();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const openCheckoutModal = useCallback(() => {
    if (!canCheckout || isMutatingCart) {
      return;
    }

    setIsCheckoutModalOpen(true);
  }, [canCheckout, isMutatingCart]);

  const closeCheckoutModal = useCallback(() => {
    if (isMutatingCart) {
      return;
    }

    setIsCheckoutModalOpen(false);
  }, [isMutatingCart]);

  if (isLoadingCart) {
    return null;
  }

  if (!cart) {
    return <PosReviewEmptyState onBack={goBackToBuilder} />;
  }

  const customerName = resolvedCustomer?.name || cart.customer_name || "Khách vãng lai";
  const franchiseDisplayName = cart.franchise_name || cart.franchise_id;

  return (
    <div className="relative min-h-[calc(100dvh-48px)] overflow-y-auto rounded-2xl border border-gray-200 bg-[#f9f9f9] shadow-sm lg:h-[calc(100dvh-48px)]">
      <main className="grid w-full grid-cols-1 gap-6 px-4 pb-28 pt-6 font-sans text-gray-900 lg:grid-cols-12 lg:gap-8 lg:px-6 lg:pb-8">
        <PosReviewMainColumn
          franchiseName={franchiseDisplayName}
          displayItems={displayItems}
          isMutatingCart={isMutatingCart}
          onBack={goBackToBuilder}
          onEditItem={editCartItem}
          onIncreaseItem={addOneMoreOfCartItem}
          onDecreaseItem={decreaseCartItemQuantity}
          onRemoveItem={removeCartItem}
          onDeleteOrder={openCancelCurrentOrderModal}
        />

        <PosReviewSummarySidebar
          cart={cart}
          customerName={customerName}
          voucherCode={voucherCode}
          isMutatingCart={isMutatingCart}
          canApplyVoucher={canApplyVoucher}
          canCheckout={canCheckout}
          onVoucherCodeChange={setVoucherCode}
          onApplyVoucher={applyVoucher}
          onRemoveVoucher={removeVoucher}
          onCheckout={openCheckoutModal}
        />
      </main>

      <PosReviewMobileNav
        canCheckout={canCheckout}
        isMutatingCart={isMutatingCart}
        onBack={goBackToBuilder}
        onCheckout={openCheckoutModal}
      />

      <PosReviewCheckoutModal
        open={isCheckoutModalOpen}
        initialValues={{
          address: draftAddress,
          phone: draftPhone,
          message: draftMessage,
        }}
        isSubmitting={isMutatingCart}
        onClose={closeCheckoutModal}
        onConfirm={checkoutCart}
      />

      <PosProductConfigModal
        open={isProductConfiguratorOpen}
        product={productBeingConfigured}
        selectedSize={configuredSize}
        quantity={configuredQuantity}
        note={configuredNote}
        totalPrice={configuredTotalPrice}
        supportsToppings={supportsToppings}
        toppingGroups={toppingGroups}
        selectedToppings={selectedToppings}
        isSubmitting={isMutatingCart}
        confirmLabel="Cập nhật món"
        onClose={closeProductConfigurator}
        onConfirm={() => {
          void saveEditedCartItem();
        }}
        onSelectSize={setConfiguredSize}
        onNoteChange={setConfiguredNote}
        onIncreaseQuantity={increaseConfiguredQuantity}
        onDecreaseQuantity={decreaseConfiguredQuantity}
        onIncreaseTopping={increaseConfiguredToppingQuantity}
        onDecreaseTopping={decreaseConfiguredToppingQuantity}
      />

      <PosCancelCartModal
        open={isCancelOrderModalOpen}
        isSubmitting={isMutatingCart}
        onClose={closeCancelCurrentOrderModal}
        onConfirm={() => {
          void confirmCancelCurrentOrder();
        }}
      />
    </div>
  );
};

export default OrderPosReviewPage;
