import { useMemo } from "react";
import { resolveProductSizeLabel } from "../services/menu-catalog.service";
import { useOrderFranchiseContext } from "./use-order-franchise-context";
import { usePosBuilderCartLifecycle } from "./use-pos-builder-cart-lifecycle";
import { usePosBuilderItemActions } from "./use-pos-builder-item-actions";
import { usePosCustomerSearch } from "./use-pos-customer-search";
import { usePosMenuData } from "./use-pos-menu-data";
import { usePosProductConfigurator } from "./use-pos-product-configurator";
import { usePosSession } from "./use-pos-session";

export const useOrderPosPage = () => {
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    switchFranchise,
  } = useOrderFranchiseContext();
  const {
    selectedCategory,
    searchQuery,
    customerKeyword,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
  } = usePosSession();
  const {
    categories,
    products,
    toppingProducts,
    productFranchiseLookup,
    isLoadingMenu,
  } = usePosMenuData(franchiseId);
  const {
    customerResults,
    isSearchingCustomers,
    searchCustomers,
    clearCustomerResults,
  } = usePosCustomerSearch(customerKeyword);
  const {
    isOpen: isProductConfiguratorOpen,
    activeProduct: productBeingConfigured,
    selectedSize: configuredSize,
    quantity: configuredQuantity,
    note: configuredNote,
    supportsToppings,
    toppingGroups,
    selectedToppings,
    totalPrice: configuredTotalPrice,
    openConfigurator,
    openConfiguratorForEdit,
    closeConfigurator,
    setSelectedSize: setConfiguredSize,
    setNote: setConfiguredNote,
    increaseQuantity: increaseConfiguredQuantity,
    decreaseQuantity: decreaseConfiguredQuantity,
    increaseToppingQuantity,
    decreaseToppingQuantity,
    buildSelection,
  } = usePosProductConfigurator(toppingProducts);
  const cartLifecycle = usePosBuilderCartLifecycle({
    franchiseId,
    franchiseName,
    clearCustomerResults,
    closeProductConfigurator: closeConfigurator,
  });
  const itemActions = usePosBuilderItemActions({
    franchiseId,
    cart: cartLifecycle.cart,
    activeCartId: cartLifecycle.activeCartId,
    selectedCustomer: cartLifecycle.selectedCustomer,
    hasPersistedCart: cartLifecycle.hasPersistedCart,
    products,
    productFranchiseLookup,
    openConfigurator,
    openConfiguratorForEdit,
    closeConfigurator,
    buildSelection,
    syncPersistedCartState: cartLifecycle.syncPersistedCartState,
    loadPersistedCart: cartLifecycle.loadPersistedCart,
    setIsMutatingCart: cartLifecycle.setIsMutatingCart,
    goToReviewPage: cartLifecycle.goToReviewPage,
  });

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;
      const matchesKeyword =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [products, searchQuery, selectedCategory]);

  const displayItems = useMemo(() => {
    const sourceItems = cartLifecycle.cart?.cart_items ?? cartLifecycle.draftItems;

    return sourceItems.map((item) => {
      const nextSizeLabel =
        item.selected_size_label ??
        resolveProductSizeLabel(productFranchiseLookup, item.product_franchise_id);

      if (!nextSizeLabel) {
        return item;
      }

      return {
        ...item,
        selected_size_label: nextSizeLabel,
      };
    });
  }, [cartLifecycle.cart?.cart_items, cartLifecycle.draftItems, productFranchiseLookup]);

  const displaySubtotal = useMemo(() => {
    if (cartLifecycle.cart) {
      return cartLifecycle.cart.subtotal_amount;
    }

    return cartLifecycle.draftItems.reduce((sum, item) => sum + item.final_line_total, 0);
  }, [cartLifecycle.cart, cartLifecycle.draftItems]);

  const canContinue = useMemo(() => {
    return Boolean(
      (cartLifecycle.selectedCustomer || cartLifecycle.cart?.customer_id) &&
      (cartLifecycle.hasPersistedCart ||
        cartLifecycle.existingActiveCart?._id ||
        cartLifecycle.draftItems.length > 0),
    );
  }, [
    cartLifecycle.cart?.customer_id,
    cartLifecycle.draftItems.length,
    cartLifecycle.existingActiveCart?._id,
    cartLifecycle.hasPersistedCart,
    cartLifecycle.selectedCustomer,
  ]);

  return {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    categories,
    products: filteredProducts,
    selectedCategory,
    searchQuery,
    customerKeyword,
    customerResults,
    selectedCustomer: cartLifecycle.selectedCustomer,
    displayItems,
    displaySubtotal,
    isLoadingMenu,
    isSearchingCustomers,
    isMutatingCart: cartLifecycle.isMutatingCart,
    isCheckingActiveCart: cartLifecycle.isCheckingActiveCart,
    hasPersistedCart: cartLifecycle.hasPersistedCart,
    hasExistingActiveCart: Boolean(cartLifecycle.existingActiveCart?._id),
    existingActiveCart: cartLifecycle.existingActiveCart,
    existingActiveCartItemCount: cartLifecycle.existingActiveCart?.cart_items?.length ?? 0,
    canContinue,
    isExistingCartModalOpen: cartLifecycle.isExistingCartModalOpen,
    isProductConfiguratorOpen,
    isEditingConfiguredProduct: itemActions.isEditingConfiguredProduct,
    productBeingConfigured,
    configuredSize,
    configuredQuantity,
    configuredNote,
    supportsToppings,
    toppingGroups,
    selectedToppings,
    configuredTotalPrice,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
    switchFranchise,
    searchCustomers,
    selectCustomer: cartLifecycle.selectCustomer,
    clearSelectedCustomer: cartLifecycle.clearSelectedCustomer,
    addProductToCart: itemActions.addProductToCart,
    editCartItem: itemActions.editCartItem,
    closeProductConfigurator: itemActions.closeProductConfigurator,
    confirmConfiguredProduct: itemActions.confirmConfiguredProduct,
    setConfiguredSize,
    setConfiguredNote,
    increaseConfiguredQuantity,
    decreaseConfiguredQuantity,
    increaseConfiguredToppingQuantity: increaseToppingQuantity,
    decreaseConfiguredToppingQuantity: decreaseToppingQuantity,
    addOneMoreOfCartItem: itemActions.addOneMoreOfCartItem,
    decreaseCartItemQuantity: itemActions.decreaseCartItemQuantity,
    removeCartItem: itemActions.removeCartItem,
    continueToReview: cartLifecycle.continueToReview,
    closeExistingCartModal: cartLifecycle.closeExistingCartModal,
    useExistingServerCart: cartLifecycle.useExistingServerCart,
    mergeDraftIntoExistingCart: cartLifecycle.mergeDraftIntoExistingCart,
  };
};
