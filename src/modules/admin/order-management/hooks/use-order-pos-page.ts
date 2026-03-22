import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail, CartItem } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import type { PosProduct } from "../models/menu.models";
import { cartService } from "../services/cart.service";
import { resolveProductSizeLabel } from "../services/menu-catalog.service";
import {
  buildSelectedToppingMapFromCartItem,
  buildStaffCartItemConfigKey,
  buildStaffCartItemInputFromCartItem,
  buildDraftCartItemFromConfiguredProduct,
  buildStaffCartItemInputFromConfiguredProduct,
  buildStaffCartItemInputsFromDraftItems,
} from "../services/pos-product-config.service";
import { addCartItemsUsecase } from "../usecases/add-cart-items.usecase";
import { getActiveCartUsecase } from "../usecases/get-active-cart.usecase";
import { useOrderFranchiseContext } from "./use-order-franchise-context";
import { usePosCustomerSearch } from "./use-pos-customer-search";
import { usePosMenuData } from "./use-pos-menu-data";
import { usePosProductConfigurator } from "./use-pos-product-configurator";
import { usePosSession } from "./use-pos-session";

const DEFAULT_COUNTER_MESSAGE = "Mua tại quầy";

interface OrderPosBuilderLocationState {
  preservePosSession?: boolean;
}

export const useOrderPosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    switchFranchise,
  } = useOrderFranchiseContext();
  const {
    selectedCustomer,
    activeCartId,
    selectedCategory,
    searchQuery,
    customerKeyword,
    draftItems,
    setSelectedCustomer,
    setActiveCartId,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
    setDraftItems,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    setVoucherCode,
    addDraftItem,
    replaceDraftItem,
    incrementDraftItem,
    decrementDraftItem,
    removeDraftItem,
    resetSession,
  } = usePosSession();
  const shouldPreserveSessionOnMount = Boolean(
    (location.state as OrderPosBuilderLocationState | null)?.preservePosSession,
  );
  const skipInitialResetRef = useRef(shouldPreserveSessionOnMount);

  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [isCheckingActiveCart, setIsCheckingActiveCart] = useState(false);
  const [cart, setCart] = useState<CartDetail | null>(null);
  const [existingActiveCart, setExistingActiveCart] = useState<CartDetail | null>(null);
  const [isExistingCartModalOpen, setIsExistingCartModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  const hasPersistedCart = Boolean(activeCartId);
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

  const defaultCounterAddress = useMemo(() => {
    return franchiseName ? `MUA_TAI_QUAY - ${franchiseName}` : "MUA_TAI_QUAY";
  }, [franchiseName]);

  const isEditingConfiguredProduct = Boolean(editingItem);

  const syncDraftFieldsFromCart = useCallback(
    (nextCart: CartDetail | null, customer?: CustomerOption | null) => {
      if (nextCart) {
        setDraftAddress(nextCart.address || defaultCounterAddress);
        setDraftPhone(nextCart.phone || customer?.phone || "");
        setDraftMessage(nextCart.message || DEFAULT_COUNTER_MESSAGE);
        setVoucherCode(nextCart.voucher_code || "");
        return;
      }

      setDraftAddress(customer?.address || defaultCounterAddress);
      setDraftPhone(customer?.phone || "");
      setDraftMessage(DEFAULT_COUNTER_MESSAGE);
      setVoucherCode("");
    },
    [defaultCounterAddress, setDraftAddress, setDraftMessage, setDraftPhone, setVoucherCode],
  );

  const ensureCartDetail = useCallback((nextCart: CartDetail | null, action: string) => {
    if (!nextCart?._id) {
      throw new Error(`[OrderPOS] ${action} returned an empty cart payload`);
    }

    return nextCart;
  }, []);

  const syncPersistedCartState = useCallback(
    (nextCart: CartDetail | null, customer?: CustomerOption | null) => {
      setCart(nextCart);
      setExistingActiveCart(nextCart);
      setActiveCartId(nextCart?._id ?? null);
      syncDraftFieldsFromCart(nextCart, customer);
    },
    [setActiveCartId, syncDraftFieldsFromCart],
  );

  const closeProductConfigurator = useCallback(() => {
    setEditingItem(null);
    closeConfigurator();
  }, [closeConfigurator]);

  const goToReviewPage = useCallback(
    (cartId: string, customerId?: string) => {
      const params = new URLSearchParams();
      params.set("cartId", cartId);

      if (customerId) {
        params.set("customerId", customerId);
      }

      if (franchiseId) {
        params.set("franchiseId", franchiseId);
      }

      navigate(
        `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS_REVIEW}?${params.toString()}`,
      );
    },
    [franchiseId, navigate],
  );

  useEffect(() => {
    if (skipInitialResetRef.current) {
      skipInitialResetRef.current = false;
      return;
    }

    resetSession({
      defaultAddress: defaultCounterAddress,
      defaultMessage: DEFAULT_COUNTER_MESSAGE,
    });
    setCart(null);
    setExistingActiveCart(null);
    setIsExistingCartModalOpen(false);
    setEditingItem(null);
    clearCustomerResults();
    closeProductConfigurator();
  }, [clearCustomerResults, closeProductConfigurator, defaultCounterAddress, franchiseId, resetSession]);

  const loadPersistedCart = useCallback(
    async (cartId: string, customer?: CustomerOption | null) => {
      try {
        const nextCart = await cartService.getCartDetail(cartId);
        setCart(nextCart);
        setExistingActiveCart(nextCart);
        setActiveCartId(nextCart?._id ?? null);
        syncDraftFieldsFromCart(nextCart, customer);
        return nextCart;
      } catch (error) {
        console.error("[OrderPOS] Failed to load persisted cart", error);
        showError("Không tải được cart đang hoạt động");
        setCart(null);
        setExistingActiveCart(null);
        setActiveCartId(null);
        return null;
      }
    },
    [setActiveCartId, showError, syncDraftFieldsFromCart],
  );

  const loadCustomerExistingCart = useCallback(
    async (customer: CustomerOption) => {
      if (!franchiseId) {
        setExistingActiveCart(null);
        return null;
      }

      try {
        setIsCheckingActiveCart(true);
        const activeCart = await getActiveCartUsecase(customer.id, franchiseId);
        setExistingActiveCart(activeCart);
        return activeCart;
      } catch (error) {
        console.error("[OrderPOS] Failed to load active cart for customer", error);
        showError("Không kiểm tra được cart active của khách hàng");
        setExistingActiveCart(null);
        return null;
      } finally {
        setIsCheckingActiveCart(false);
      }
    },
    [franchiseId, showError],
  );

  useEffect(() => {
    if (!selectedCustomer) {
      setCart(null);
      setExistingActiveCart(null);
      setActiveCartId(null);
      syncDraftFieldsFromCart(null, null);
      return;
    }

    if (activeCartId) {
      void loadPersistedCart(activeCartId, selectedCustomer);
      return;
    }

    setCart(null);
    syncDraftFieldsFromCart(null, selectedCustomer);
    void loadCustomerExistingCart(selectedCustomer);
  }, [
    activeCartId,
    loadCustomerExistingCart,
    loadPersistedCart,
    selectedCustomer,
    setActiveCartId,
    syncDraftFieldsFromCart,
  ]);

  const handleSelectCustomer = useCallback(
    (customer: CustomerOption) => {
      setSelectedCustomer(customer);
      setCustomerKeyword(customer.name);
      setActiveCartId(null);
      setCart(null);
      setExistingActiveCart(null);
      setIsExistingCartModalOpen(false);
      clearCustomerResults();
      closeProductConfigurator();
      syncDraftFieldsFromCart(null, customer);
      showInfo(`Đã chọn khách hàng ${customer.name}`);
    },
    [
      clearCustomerResults,
      closeProductConfigurator,
      setActiveCartId,
      setCustomerKeyword,
      setSelectedCustomer,
      showInfo,
      syncDraftFieldsFromCart,
    ],
  );

  const clearSelectedCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerKeyword("");
    clearCustomerResults();
    setCart(null);
    setExistingActiveCart(null);
    setActiveCartId(null);
    setIsExistingCartModalOpen(false);
    closeProductConfigurator();
    syncDraftFieldsFromCart(null, null);
  }, [
    clearCustomerResults,
    closeProductConfigurator,
    setActiveCartId,
    setCustomerKeyword,
    setSelectedCustomer,
    syncDraftFieldsFromCart,
  ]);

  const productCatalogLookup = useMemo(() => {
    return products.reduce<Record<string, PosProduct>>((lookup, product) => {
      lookup[product.product_id] = product;
      return lookup;
    }, {});
  }, [products]);

  const ensureCanBrowsePos = useCallback(() => {
    if (!franchiseId) {
      showError("Bạn cần chọn chi nhánh trước khi bán hàng");
      return false;
    }
    return true;
  }, [franchiseId, showError]);

  const resolveProductForCartItem = useCallback(
    (item: CartItem) => {
      const productId = productFranchiseLookup[item.product_franchise_id]?.product_id;

      if (productId && productCatalogLookup[productId]) {
        return productCatalogLookup[productId];
      }

      return (
        products.find((product) =>
          product.sizes.some((size) => size.product_franchise_id === item.product_franchise_id),
        ) ?? null
      );
    },
    [productCatalogLookup, productFranchiseLookup, products],
  );

  const editCartItem = useCallback(
    (item: CartItem) => {
      if (!ensureCanBrowsePos()) {
        return;
      }

      if (hasPersistedCart) {
        const targetCartId = cart?._id ?? activeCartId;
        const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;

        if (!targetCartId || !targetCustomerId) {
          showError("Không xác định được cart active để sang bước kiểm tra đơn");
          return;
        }

        showInfo("Món trong cart active sẽ được chỉnh topping ở bước kiểm tra đơn");
        goToReviewPage(targetCartId, targetCustomerId);
        return;
      }

      const product = resolveProductForCartItem(item);

      if (!product) {
        showError("Không tìm thấy cấu hình món này trong menu hiện tại");
        return;
      }

      setEditingItem(item);
      openConfiguratorForEdit(product, {
        selectedSizeId: item.product_franchise_id,
        quantity: item.quantity,
        note: item.note,
        selectedToppings: buildSelectedToppingMapFromCartItem(item),
      });
    },
    [
      activeCartId,
      cart?._id,
      cart?.customer_id,
      ensureCanBrowsePos,
      goToReviewPage,
      hasPersistedCart,
      openConfiguratorForEdit,
      resolveProductForCartItem,
      selectedCustomer,
      showError,
      showInfo,
    ],
  );

  const persistDraftToServerCart = useCallback(
    async (customer: CustomerOption) => {
      if (!franchiseId || draftItems.length === 0) {
        return existingActiveCart;
      }

      const nextCart = await addCartItemsUsecase(
        customer.id,
        franchiseId,
        buildStaffCartItemInputsFromDraftItems(draftItems),
      );

      setCart(nextCart);
      setExistingActiveCart(nextCart);
      setActiveCartId(nextCart?._id ?? null);
      setDraftItems([]);
      syncDraftFieldsFromCart(nextCart, customer);
      return nextCart;
    },
    [
      draftItems,
      existingActiveCart,
      franchiseId,
      setActiveCartId,
      setDraftItems,
      syncDraftFieldsFromCart,
    ],
  );

  const addProductToCart = useCallback(
    (product: PosProduct) => {
      if (!ensureCanBrowsePos()) {
        return;
      }

      setEditingItem(null);
      openConfigurator(product);
    },
    [ensureCanBrowsePos, openConfigurator],
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

    const nextDraftItem = buildDraftCartItemFromConfiguredProduct(selection);
    const nextCartItemInput = buildStaffCartItemInputFromConfiguredProduct(selection);

    if (!hasPersistedCart) {
      if (editingItem) {
        replaceDraftItem(editingItem.cart_item_id, nextDraftItem);
        showSuccess("Đã cập nhật món trong đơn nháp");
      } else {
        addDraftItem(nextDraftItem);
      }

      closeProductConfigurator();
      return;
    }

    const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;

    if (!targetCustomerId) {
      showError("Không xác định được customer để cập nhật cart");
      return;
    }

    if (editingItem) {
      const currentCartItemInput = buildStaffCartItemInputFromCartItem(editingItem);
      const hasSameConfiguration =
        buildStaffCartItemConfigKey(currentCartItemInput) ===
        buildStaffCartItemConfigKey(nextCartItemInput);
      const hasSameQuantity = currentCartItemInput.quantity === nextCartItemInput.quantity;

      if (hasSameConfiguration && hasSameQuantity) {
        closeProductConfigurator();
        return;
      }

      try {
        setIsMutatingCart(true);

        if (hasSameConfiguration) {
          const nextCart = ensureCartDetail(
            await cartService.updateCartItem({
              cart_item_id: editingItem.cart_item_id,
              quantity: nextCartItemInput.quantity,
            }),
            "updateCartItem",
          );

          syncPersistedCartState(nextCart, selectedCustomer);
        } else {
          let deletedOriginalItem = false;

          try {
            await cartService.deleteCartItem(editingItem.cart_item_id);
            deletedOriginalItem = true;

            const nextCart = ensureCartDetail(
              await addCartItemsUsecase(targetCustomerId, franchiseId, [nextCartItemInput]),
              "replaceCartItem",
            );

            syncPersistedCartState(nextCart, selectedCustomer);
          } catch (error) {
            if (deletedOriginalItem) {
              try {
                const restoredCart = await addCartItemsUsecase(targetCustomerId, franchiseId, [
                  currentCartItemInput,
                ]);

                if (restoredCart?._id) {
                  syncPersistedCartState(restoredCart, selectedCustomer);
                }
              } catch (restoreError) {
                console.error("[OrderPOS] Failed to restore cart item after edit error", restoreError);
              }
            }

            throw error;
          }
        }

        closeProductConfigurator();
        showSuccess("Đã cập nhật món trong cart");
      } catch (error) {
        console.error("[OrderPOS] Failed to edit configured product", error);
        showError("Không cập nhật được món trong cart");
      } finally {
        setIsMutatingCart(false);
      }

      return;
    }

    try {
      setIsMutatingCart(true);
      const nextCart = ensureCartDetail(
        await addCartItemsUsecase(targetCustomerId, franchiseId, [nextCartItemInput]),
        "addConfiguredProduct",
      );

      syncPersistedCartState(nextCart, selectedCustomer);
      closeProductConfigurator();
    } catch (error) {
      console.error("[OrderPOS] Failed to add configured product", error);
      showError("Không thêm được món vào cart");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    addDraftItem,
    buildSelection,
    closeProductConfigurator,
    editingItem,
    ensureCanBrowsePos,
    ensureCartDetail,
    franchiseId,
    hasPersistedCart,
    replaceDraftItem,
    cart?.customer_id,
    selectedCustomer,
    showSuccess,
    showError,
    syncPersistedCartState,
  ]);

  const addOneMoreOfCartItem = useCallback(
    async (item: CartItem) => {
      if (!hasPersistedCart) {
        incrementDraftItem(item.cart_item_id);
        return;
      }

      const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;

      if (!targetCustomerId || !franchiseId) {
        showError("Không xác định được customer để cập nhật cart");
        return;
      }

      try {
        setIsMutatingCart(true);
        const nextCart = await addCartItemsUsecase(targetCustomerId, franchiseId, [
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
        setExistingActiveCart(nextCart);
        setActiveCartId(nextCart?._id ?? null);
        syncDraftFieldsFromCart(nextCart, selectedCustomer);
      } catch (error) {
        console.error("[OrderPOS] Failed to add quantity", error);
        showError("Không tăng được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      cart?.customer_id,
      franchiseId,
      hasPersistedCart,
      incrementDraftItem,
      selectedCustomer,
      setActiveCartId,
      showError,
      syncDraftFieldsFromCart,
    ],
  );

  const decreaseCartItemQuantity = useCallback(
    async (item: CartItem) => {
      if (!hasPersistedCart) {
        decrementDraftItem(item.cart_item_id);
        return;
      }

      const targetCartId = cart?._id ?? activeCartId;

      if (!targetCartId) {
        showError("Không xác định được cart để cập nhật");
        return;
      }

      try {
        setIsMutatingCart(true);

        if (item.quantity <= 1) {
          await cartService.deleteCartItem(item.cart_item_id);
          await loadPersistedCart(targetCartId, selectedCustomer);
        } else {
          const nextCart = await cartService.updateCartItem({
            cart_item_id: item.cart_item_id,
            quantity: item.quantity - 1,
          });

          setCart(nextCart);
          setExistingActiveCart(nextCart);
          syncDraftFieldsFromCart(nextCart, selectedCustomer);
        }
      } catch (error) {
        console.error("[OrderPOS] Failed to decrease cart item quantity", error);
        showError("Không giảm được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      activeCartId,
      cart?._id,
      decrementDraftItem,
      hasPersistedCart,
      loadPersistedCart,
      selectedCustomer,
      showError,
      syncDraftFieldsFromCart,
    ],
  );

  const removeCartItem = useCallback(
    async (cartItemId: string) => {
      if (!hasPersistedCart) {
        removeDraftItem(cartItemId);
        return;
      }

      const targetCartId = cart?._id ?? activeCartId;

      if (!targetCartId) {
        showError("Không xác định được cart để cập nhật");
        return;
      }

      try {
        setIsMutatingCart(true);
        await cartService.deleteCartItem(cartItemId);
        await loadPersistedCart(targetCartId, selectedCustomer);

        if (editingItem?.cart_item_id === cartItemId) {
          closeProductConfigurator();
        }
      } catch (error) {
        console.error("[OrderPOS] Failed to remove cart item", error);
        showError("Không xóa được món khỏi cart");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      activeCartId,
      cart?._id,
      closeProductConfigurator,
      editingItem?.cart_item_id,
      hasPersistedCart,
      loadPersistedCart,
      removeDraftItem,
      selectedCustomer,
      showError,
    ],
  );

  const continueWithExistingServerCart = useCallback(() => {
    if (!existingActiveCart?._id || !selectedCustomer) {
      return;
    }

    setDraftItems([]);
    setCart(existingActiveCart);
    setActiveCartId(existingActiveCart._id);
    syncDraftFieldsFromCart(existingActiveCart, selectedCustomer);
    setIsExistingCartModalOpen(false);
    goToReviewPage(existingActiveCart._id, selectedCustomer.id);
  }, [
    existingActiveCart,
    goToReviewPage,
    selectedCustomer,
    setActiveCartId,
    setDraftItems,
    syncDraftFieldsFromCart,
  ]);

  const mergeDraftIntoExistingCart = useCallback(async () => {
    if (!selectedCustomer || !existingActiveCart?._id) {
      showError("Không tìm thấy cart active để gộp món");
      return;
    }

    try {
      setIsMutatingCart(true);
      const nextCart = await persistDraftToServerCart(selectedCustomer);

      if (!nextCart?._id) {
        showError("Không gộp được món vào cart hiện tại");
        return;
      }

      setIsExistingCartModalOpen(false);
      showSuccess("Đã thêm các món local vào cart active");
      goToReviewPage(nextCart._id, selectedCustomer.id);
    } catch (error) {
      console.error("[OrderPOS] Failed to merge draft into existing cart", error);
      showError("Không gộp được món vào cart active");
    } finally {
      setIsMutatingCart(false);
    }
  }, [existingActiveCart?._id, goToReviewPage, persistDraftToServerCart, selectedCustomer, showError, showSuccess]);

  const continueToReview = useCallback(async () => {
    const customerId = selectedCustomer?.id ?? cart?.customer_id;

    if (!customerId) {
      showError("Hãy chọn khách hàng trước khi kiểm tra đơn");
      return;
    }

    if (hasPersistedCart && (cart?._id || activeCartId)) {
      goToReviewPage(cart?._id ?? activeCartId ?? "", customerId);
      return;
    }

    if (existingActiveCart?._id) {
      if (draftItems.length > 0) {
        setIsExistingCartModalOpen(true);
        return;
      }

      continueWithExistingServerCart();
      return;
    }

    if (!franchiseId) {
      showError("Bạn cần chọn chi nhánh trước khi tạo đơn");
      return;
    }

    if (draftItems.length === 0) {
      showError("Chưa có món nào để kiểm tra đơn");
      return;
    }

    if (!selectedCustomer) {
      showError("Hãy chọn khách hàng trước khi kiểm tra đơn");
      return;
    }

    try {
      setIsMutatingCart(true);
      const nextCart = await persistDraftToServerCart(selectedCustomer);

      if (!nextCart?._id) {
        showError("Không tạo được cart để sang bước kiểm tra đơn");
        return;
      }

      showSuccess("Đã tạo cart để kiểm tra đơn");
      goToReviewPage(nextCart._id, selectedCustomer.id);
    } catch (error) {
      console.error("[OrderPOS] Failed to prepare review cart", error);
      showError("Không tạo được cart để kiểm tra đơn");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    activeCartId,
    cart?._id,
    cart?.customer_id,
    draftItems.length,
    existingActiveCart,
    franchiseId,
    goToReviewPage,
    hasPersistedCart,
    persistDraftToServerCart,
    selectedCustomer,
    showError,
    showSuccess,
    continueWithExistingServerCart,
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

  const canContinue = useMemo(() => {
    return Boolean(
      (selectedCustomer || cart?.customer_id) &&
      (hasPersistedCart || existingActiveCart?._id || draftItems.length > 0),
    );
  }, [cart?.customer_id, draftItems.length, existingActiveCart?._id, hasPersistedCart, selectedCustomer]);

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
    selectedCustomer,
    displayItems,
    displaySubtotal,
    isLoadingMenu,
    isSearchingCustomers,
    isMutatingCart,
    isCheckingActiveCart,
    hasPersistedCart,
    hasExistingActiveCart: Boolean(existingActiveCart?._id),
    existingActiveCart,
    existingActiveCartItemCount: existingActiveCart?.cart_items?.length ?? 0,
    canContinue,
    isExistingCartModalOpen,
    isProductConfiguratorOpen,
    isEditingConfiguredProduct,
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
    selectCustomer: handleSelectCustomer,
    clearSelectedCustomer,
    addProductToCart,
    editCartItem,
    closeProductConfigurator,
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
    continueToReview,
    closeExistingCartModal: () => setIsExistingCartModalOpen(false),
    useExistingServerCart: continueWithExistingServerCart,
    mergeDraftIntoExistingCart,
  };
};
