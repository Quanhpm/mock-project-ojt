import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { usePosProductConfigurator } from "./use-pos-product-configurator";
import { usePosReviewActions } from "./use-pos-review-actions";
import { usePosReviewLoader } from "./use-pos-review-loader";

export const useOrderPosReviewPage = () => {
  const navigate = useNavigate();
  const loader = usePosReviewLoader();
  const configurator = usePosProductConfigurator(loader.toppingProducts);
  const actions = usePosReviewActions({
    cart: loader.cart,
    setCart: loader.setCart,
    draftAddress: loader.draftAddress,
    draftPhone: loader.draftPhone,
    draftMessage: loader.draftMessage,
    voucherCode: loader.voucherCode,
    setActiveCartId: loader.setActiveCartId,
    setIsMutatingCart: loader.setIsMutatingCart,
    ensureCartDetail: loader.ensureCartDetail,
    hydrateReviewCart: loader.hydrateReviewCart,
    syncVoucherFromCart: loader.syncVoucherFromCart,
    refreshCartDetail: loader.refreshCartDetail,
    loadReviewCart: loader.loadReviewCart,
    products: loader.products,
    productFranchiseLookup: loader.productFranchiseLookup,
    openConfiguratorForEdit: configurator.openConfiguratorForEdit,
    closeConfigurator: configurator.closeConfigurator,
    buildSelection: configurator.buildSelection,
  });

  const goBackToBuilder = useCallback(() => {
    navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS}`, {
      state: { preservePosSession: true },
    });
  }, [navigate]);

  return {
    cart: loader.cart,
    resolvedCustomer: loader.resolvedCustomer,
    displayItems: loader.displayItems,
    draftAddress: loader.draftAddress,
    draftPhone: loader.draftPhone,
    draftMessage: loader.draftMessage,
    voucherCode: loader.voucherCode,
    isLoadingCart: loader.isLoadingCart,
    isMutatingCart: loader.isMutatingCart,
    canCheckout: actions.canCheckout,
    canApplyVoucher: actions.canApplyVoucher,
    isProductConfiguratorOpen: configurator.isOpen,
    productBeingConfigured: configurator.activeProduct,
    configuredSize: configurator.selectedSize,
    configuredQuantity: configurator.quantity,
    configuredNote: configurator.note,
    supportsToppings: configurator.supportsToppings,
    toppingGroups: configurator.toppingGroups,
    selectedToppings: configurator.selectedToppings,
    configuredTotalPrice: configurator.totalPrice,
    setDraftAddress: loader.setDraftAddress,
    setDraftPhone: loader.setDraftPhone,
    setDraftMessage: loader.setDraftMessage,
    setVoucherCode: loader.setVoucherCode,
    editCartItem: actions.editCartItem,
    closeProductConfigurator: actions.closeProductConfigurator,
    saveEditedCartItem: actions.saveEditedCartItem,
    setConfiguredSize: configurator.setSelectedSize,
    setConfiguredNote: configurator.setNote,
    increaseConfiguredQuantity: configurator.increaseQuantity,
    decreaseConfiguredQuantity: configurator.decreaseQuantity,
    increaseConfiguredToppingQuantity: configurator.increaseToppingQuantity,
    decreaseConfiguredToppingQuantity: configurator.decreaseToppingQuantity,
    applyVoucher: actions.applyVoucher,
    removeVoucher: actions.removeVoucher,
    addOneMoreOfCartItem: actions.addOneMoreOfCartItem,
    decreaseCartItemQuantity: actions.decreaseCartItemQuantity,
    removeCartItem: actions.removeCartItem,
    checkoutCart: actions.checkoutCart,
    goBackToBuilder,
  };
};
