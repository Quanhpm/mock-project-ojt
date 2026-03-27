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
  } = useOrderFranchiseContext({ adminGlobalScopeKey: "order-pos" });
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
    clearCustomerResults,
    closeProductConfigurator: closeConfigurator,
  });
  const itemActions = usePosBuilderItemActions({
    franchiseId,
    cart: cartLifecycle.cart,
    activeCartId: cartLifecycle.activeCartId,
    selectedCustomer: cartLifecycle.selectedCustomer,
    openConfigurator,
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
    const sourceItems = cartLifecycle.cart?.cart_items ?? [];

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
  }, [cartLifecycle.cart?.cart_items, productFranchiseLookup]);

  const displaySubtotal = useMemo(() => {
    return cartLifecycle.cart?.subtotal_amount ?? 0;
  }, [cartLifecycle.cart?.subtotal_amount]);

  const canContinue = Boolean(
    cartLifecycle.selectedCustomer &&
    cartLifecycle.cart?._id &&
    (cartLifecycle.cart.cart_items?.length ?? 0) > 0,
  );

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
    activeCartId: cartLifecycle.activeCartId,
    canContinue,
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
  };
};
