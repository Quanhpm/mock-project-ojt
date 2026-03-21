import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail, CartItem } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import type { PosProduct } from "../models/menu.models";
import { cartService } from "../services/cart.service";
import { resolveProductSizeLabel } from "../services/menu-catalog.service";
import {
  buildDraftCartItemFromConfiguredProduct,
  buildStaffCartItemInputFromConfiguredProduct,
} from "../services/pos-product-config.service";
import { addCartItemsUsecase } from "../usecases/add-cart-items.usecase";
import { checkoutCartUsecase } from "../usecases/checkout-cart.usecase";
import { getActiveCartUsecase } from "../usecases/get-active-cart.usecase";
import { useOrderFranchiseContext } from "./use-order-franchise-context";
import { usePosCustomerSearch } from "./use-pos-customer-search";
import { usePosMenuData } from "./use-pos-menu-data";
import { usePosProductConfigurator } from "./use-pos-product-configurator";
import { usePosSession } from "./use-pos-session";

const DEFAULT_COUNTER_MESSAGE = "Mua tại quầy";

export const useOrderPosPage = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    switchFranchise,
  } = useOrderFranchiseContext();
  const {
    selectedCustomer,
    activeCartId,
    selectedCategory,
    searchQuery,
    customerKeyword,
    draftItems,
    draftAddress,
    draftPhone,
    draftMessage,
    setSelectedCustomer,
    setActiveCartId,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
    setDraftItems,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    addDraftItem,
    incrementDraftItem,
    decrementDraftItem,
    removeDraftItem,
    resetSession,
  } = usePosSession();

  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [cart, setCart] = useState<CartDetail | null>(null);
  const hasPersistedCart = Boolean(cart?._id);
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

  const defaultCounterAddress = useMemo(() => {
    return franchiseName
      ? `MUA_TAI_QUAY - ${franchiseName}`
      : "MUA_TAI_QUAY";
  }, [franchiseName]);

  useEffect(() => {
    resetSession({
      defaultAddress: defaultCounterAddress,
      defaultMessage: DEFAULT_COUNTER_MESSAGE,
    });
    setCart(null);
    clearCustomerResults();
    closeConfigurator();
  }, [clearCustomerResults, closeConfigurator, defaultCounterAddress, franchiseId, resetSession]);

  const syncDraftFromCart = useCallback(
    (nextCart: CartDetail | null, customer?: CustomerOption | null) => {
      if (nextCart) {
        setDraftAddress(nextCart.address || defaultCounterAddress);
        setDraftPhone(nextCart.phone || customer?.phone || "");
        setDraftMessage(nextCart.message || DEFAULT_COUNTER_MESSAGE);
        return;
      }

      setDraftAddress(customer?.address || defaultCounterAddress);
      setDraftPhone(customer?.phone || "");
      setDraftMessage(DEFAULT_COUNTER_MESSAGE);
    },
    [defaultCounterAddress, setDraftAddress, setDraftMessage, setDraftPhone],
  );

  const loadActiveCart = useCallback(
    async (customerId: string, customer?: CustomerOption | null) => {
      try {
        const activeCart = await getActiveCartUsecase(customerId);
        setCart(activeCart);
        setActiveCartId(activeCart?._id ?? null);
        syncDraftFromCart(activeCart, customer);
      } catch (error) {
        console.error("[OrderPOS] Failed to load active cart", error);
        showError("Không tải được giỏ hàng đang hoạt động");
        setCart(null);
        setActiveCartId(null);
        syncDraftFromCart(null, customer);
      }
    },
    [setActiveCartId, showError, syncDraftFromCart],
  );

  useEffect(() => {
    if (!selectedCustomer) {
      setCart(null);
      setActiveCartId(null);
      syncDraftFromCart(null, null);
      return;
    }

    if (draftItems.length > 0) {
      return;
    }

    void loadActiveCart(selectedCustomer.id, selectedCustomer);
  }, [draftItems.length, loadActiveCart, selectedCustomer, setActiveCartId, syncDraftFromCart]);

  const handleSelectCustomer = useCallback(
    (customer: CustomerOption) => {
      setSelectedCustomer(customer);
      setCustomerKeyword(customer.name);
      clearCustomerResults();
      syncDraftFromCart(null, customer);
      showInfo(`Đã chọn khách hàng ${customer.name}`);
    },
    [clearCustomerResults, setSelectedCustomer, setCustomerKeyword, showInfo, syncDraftFromCart],
  );

  const clearSelectedCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerKeyword("");
    clearCustomerResults();
    setCart(null);
    setActiveCartId(null);
    syncDraftFromCart(null, null);
  }, [
    clearCustomerResults,
    setActiveCartId,
    setCustomerKeyword,
    setSelectedCustomer,
    syncDraftFromCart,
  ]);

  const ensureCanBrowsePos = useCallback(() => {
    if (!franchiseId) {
      showError("Bạn cần chọn chi nhánh trước khi bán hàng");
      return false;
    }
    return true;
  }, [franchiseId, showError]);

  const syncDraftItemsToCart = useCallback(
    async (customer: CustomerOption) => {
      if (!franchiseId || draftItems.length === 0) {
        return cart;
      }

      try {
        setIsMutatingCart(true);
        const nextCart = await addCartItemsUsecase(
          customer.id,
          franchiseId,
          draftItems.map((item) => ({
            product_franchise_id: item.product_franchise_id,
            quantity: item.quantity,
            note: item.note,
            options: item.options.map((option) => ({
              product_franchise_id: option.product_franchise_id,
              quantity: option.quantity,
            })),
          })),
        );

        setCart(nextCart);
        setActiveCartId(nextCart?._id ?? null);
        setDraftItems([]);
        syncDraftFromCart(nextCart, customer);
        showSuccess("Đã đồng bộ các món tạm vào giỏ của khách hàng");
        return nextCart;
      } catch (error) {
        console.error("[OrderPOS] Failed to sync draft items", error);
        showError("Không đồng bộ được các món tạm vào cart");
        return null;
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      cart,
      draftItems,
      franchiseId,
      setActiveCartId,
      setDraftItems,
      showError,
      showSuccess,
      syncDraftFromCart,
    ],
  );

  useEffect(() => {
    if (!selectedCustomer || draftItems.length === 0) {
      return;
    }

    void syncDraftItemsToCart(selectedCustomer);
  }, [draftItems.length, selectedCustomer, syncDraftItemsToCart]);

  const addProductToCart = useCallback(
    (product: PosProduct) => {
      if (!ensureCanBrowsePos()) {
        return;
      }

      openConfigurator(product);
    },
    [
      ensureCanBrowsePos,
      openConfigurator,
    ],
  );

  const confirmConfiguredProduct = useCallback(async () => {
    if (!ensureCanBrowsePos() || !franchiseId) {
      return;
    }

    const selection = buildSelection();

    if (!selection) {
      showError("Sản phẩm này chưa có size khả dụng");
      return;
    }

    if (!selectedCustomer) {
      addDraftItem(buildDraftCartItemFromConfiguredProduct(selection));
      closeConfigurator();
      return;
    }

    try {
      setIsMutatingCart(true);
      const nextCart = await addCartItemsUsecase(selectedCustomer.id, franchiseId, [
        buildStaffCartItemInputFromConfiguredProduct(selection),
      ]);

      setCart(nextCart);
      setActiveCartId(nextCart?._id ?? null);
      syncDraftFromCart(nextCart, selectedCustomer);
      closeConfigurator();
    } catch (error) {
      console.error("[OrderPOS] Failed to add configured product", error);
      showError("Không thêm được món vào giỏ");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    addDraftItem,
    buildSelection,
    closeConfigurator,
    ensureCanBrowsePos,
    franchiseId,
    selectedCustomer,
    setActiveCartId,
    showError,
    syncDraftFromCart,
  ]);

  const addOneMoreOfCartItem = useCallback(
    async (item: CartItem) => {
      if (!franchiseId) {
        return;
      }

      if (!selectedCustomer || !hasPersistedCart) {
        incrementDraftItem(item.cart_item_id);
        return;
      }

      try {
        setIsMutatingCart(true);
        const nextCart = await addCartItemsUsecase(selectedCustomer.id, franchiseId, [
          {
            product_franchise_id: item.product_franchise_id,
            quantity: 1,
            note: item.note,
            options: item.options.map((option) => ({
              product_franchise_id: option.product_franchise_id,
              quantity: option.quantity,
            })),
          },
        ]);

        setCart(nextCart);
        setActiveCartId(nextCart?._id ?? null);
        syncDraftFromCart(nextCart, selectedCustomer);
      } catch (error) {
        console.error("[OrderPOS] Failed to add quantity", error);
        showError("Không tăng được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      franchiseId,
      hasPersistedCart,
      incrementDraftItem,
      selectedCustomer,
      setActiveCartId,
      showError,
      syncDraftFromCart,
    ],
  );

  const decreaseCartItemQuantity = useCallback(
    async (item: CartItem) => {
      if (!selectedCustomer || !hasPersistedCart) {
        decrementDraftItem(item.cart_item_id);
        return;
      }

      try {
        setIsMutatingCart(true);

        if (item.quantity <= 1) {
          await cartService.deleteCartItem(item.cart_item_id);
        } else {
          await cartService.updateCartItem({
            cart_item_id: item.cart_item_id,
            quantity: item.quantity - 1,
          });
        }

        await loadActiveCart(selectedCustomer.id, selectedCustomer);
      } catch (error) {
        console.error("[OrderPOS] Failed to decrease cart item quantity", error);
        showError("Không giảm được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [decrementDraftItem, hasPersistedCart, loadActiveCart, selectedCustomer, showError],
  );

  const removeCartItem = useCallback(
    async (cartItemId: string) => {
      if (!selectedCustomer || !hasPersistedCart) {
        removeDraftItem(cartItemId);
        return;
      }

      try {
        setIsMutatingCart(true);
        await cartService.deleteCartItem(cartItemId);
        await loadActiveCart(selectedCustomer.id, selectedCustomer);
      } catch (error) {
        console.error("[OrderPOS] Failed to remove cart item", error);
        showError("Không xóa được món khỏi giỏ");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [hasPersistedCart, loadActiveCart, removeDraftItem, selectedCustomer, showError],
  );

  const saveCartInfo = useCallback(async () => {
    if (!activeCartId) {
      showError("Chưa có giỏ hàng để cập nhật");
      return false;
    }

    try {
      setIsMutatingCart(true);
      const nextCart = await cartService.updateCart(activeCartId, {
        address: draftAddress || defaultCounterAddress,
        phone: draftPhone,
        message: draftMessage,
      });

      setCart(nextCart);
      setActiveCartId(nextCart?._id ?? activeCartId);
      showSuccess("Đã lưu thông tin giỏ hàng");
      return true;
    } catch (error) {
      console.error("[OrderPOS] Failed to update cart info", error);
      showError("Không lưu được thông tin giỏ hàng");
      return false;
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    activeCartId,
    defaultCounterAddress,
    draftAddress,
    draftMessage,
    draftPhone,
    setActiveCartId,
    showError,
    showSuccess,
  ]);

  const checkoutCart = useCallback(async () => {
    if (!selectedCustomer) {
      showError("Hãy chọn khách hàng trước khi checkout");
      return;
    }

    let checkoutTarget = cart;

    if (!checkoutTarget?._id && draftItems.length > 0) {
      checkoutTarget = await syncDraftItemsToCart(selectedCustomer);
    }

    if (!checkoutTarget?._id) {
      showError("Chưa có giỏ hàng để checkout");
      return;
    }

    if (!draftPhone) {
      showError("Số điện thoại đang trống, vui lòng kiểm tra lại khách hàng");
      return;
    }

    try {
      setIsMutatingCart(true);
      const order = await checkoutCartUsecase(checkoutTarget._id, {
        address: draftAddress || defaultCounterAddress,
        phone: draftPhone,
        message: draftMessage,
      });

      if (!order?._id) {
        showError("Checkout thành công nhưng chưa lấy được order detail");
        return;
      }

      showSuccess("Checkout thành công");
      setCart(null);
      setActiveCartId(null);
      navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER}/${order._id}`);
    } catch (error) {
      console.error("[OrderPOS] Failed to checkout cart", error);
      showError("Checkout thất bại");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    defaultCounterAddress,
    draftAddress,
    draftItems.length,
    draftMessage,
    draftPhone,
    navigate,
    selectedCustomer,
    setActiveCartId,
    showError,
    showSuccess,
    syncDraftItemsToCart,
    cart,
  ]);

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
    const sourceItems = cart?.cart_items ?? draftItems;

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
  }, [cart?.cart_items, draftItems, productFranchiseLookup]);

  const displaySubtotal = useMemo(() => {
    if (cart) {
      return cart.subtotal_amount;
    }

    return draftItems.reduce((sum, item) => sum + item.final_line_total, 0);
  }, [cart, draftItems]);

  const displayFinalAmount = useMemo(() => {
    return cart?.final_amount ?? displaySubtotal;
  }, [cart?.final_amount, displaySubtotal]);

  const canCheckout = useMemo(() => {
    return Boolean(selectedCustomer && (cart?._id || draftItems.length > 0));
  }, [cart?._id, draftItems.length, selectedCustomer]);

  return {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    categories,
    products: filteredProducts,
    selectedCategory,
    searchQuery,
    customerKeyword,
    customerResults,
    selectedCustomer,
    cart,
    displayItems,
    displaySubtotal,
    displayFinalAmount,
    draftAddress,
    draftPhone,
    draftMessage,
    isLoadingMenu,
    isSearchingCustomers,
    isMutatingCart,
    hasActiveCart: hasPersistedCart,
    hasDraftItems: draftItems.length > 0,
    canCheckout,
    isProductConfiguratorOpen,
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
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    switchFranchise,
    searchCustomers,
    selectCustomer: handleSelectCustomer,
    clearSelectedCustomer,
    addProductToCart,
    closeProductConfigurator: closeConfigurator,
    confirmConfiguredProduct,
    setConfiguredSize,
    setConfiguredNote,
    increaseConfiguredQuantity,
    decreaseConfiguredQuantity,
    increaseConfiguredToppingQuantity: increaseToppingQuantity,
    decreaseConfiguredToppingQuantity: decreaseToppingQuantity,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
    saveCartInfo,
    checkoutCart,
  };
};
