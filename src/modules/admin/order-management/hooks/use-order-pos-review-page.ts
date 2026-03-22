import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail, CartItem } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import { cartService } from "../services/cart.service";
import { customerService } from "../services/customer.service";
import { resolveProductSizeLabel } from "../services/menu-catalog.service";
import {
  buildSelectedToppingMapFromCartItem,
  buildStaffCartItemConfigKey,
  buildStaffCartItemInputFromCartItem,
  buildStaffCartItemInputFromConfiguredProduct,
} from "../services/pos-product-config.service";
import { addCartItemsUsecase } from "../usecases/add-cart-items.usecase";
import { checkoutCartUsecase } from "../usecases/checkout-cart.usecase";
import { getActiveCartUsecase } from "../usecases/get-active-cart.usecase";
import { usePosMenuData } from "./use-pos-menu-data";
import { usePosProductConfigurator } from "./use-pos-product-configurator";
import { usePosSession } from "./use-pos-session";

const DEFAULT_COUNTER_MESSAGE = "Mua tại quầy";

const buildCustomerOptionFromCart = (cart: CartDetail): CustomerOption => {
  return {
    id: cart.customer_id,
    name: cart.customer_name || "Khách hàng",
    phone: cart.phone || "",
    email: "",
    address: cart.address || "",
    is_active: true,
  };
};

export const useOrderPosReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();
  const {
    selectedCustomer,
    activeCartId,
    reviewContactCustomerId,
    selectedAdminFranchiseId,
    draftAddress,
    draftPhone,
    draftMessage,
    voucherCode,
    setSelectedCustomer,
    setActiveCartId,
    setReviewContactCustomerId,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    setVoucherCode,
  } = usePosSession();

  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [cart, setCart] = useState<CartDetail | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const selectedCustomerIdRef = useRef<string | null>(selectedCustomer?.id ?? null);
  const reviewContactCustomerIdRef = useRef<string | null>(reviewContactCustomerId);
  const draftMessageRef = useRef(draftMessage);

  const cartIdFromQuery = searchParams.get("cartId");
  const customerIdFromQuery = searchParams.get("customerId");
  const franchiseIdFromQuery = searchParams.get("franchiseId");
  const { products, toppingProducts, productFranchiseLookup } = usePosMenuData(
    cart?.franchise_id ?? null,
  );
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

  const syncVoucherFromCart = useCallback(
    (nextCart: CartDetail) => {
      setVoucherCode(nextCart.voucher_code || "");
    },
    [setVoucherCode],
  );

  useEffect(() => {
    selectedCustomerIdRef.current = selectedCustomer?.id ?? null;
  }, [selectedCustomer?.id]);

  useEffect(() => {
    reviewContactCustomerIdRef.current = reviewContactCustomerId;
  }, [reviewContactCustomerId]);

  useEffect(() => {
    draftMessageRef.current = draftMessage;
  }, [draftMessage]);

  const ensureCartDetail = useCallback((nextCart: CartDetail | null, action: string) => {
    if (!nextCart?._id) {
      throw new Error(`[OrderPOSReview] ${action} returned an empty cart payload`);
    }

    return nextCart;
  }, []);

  const hydrateReviewCart = useCallback(
    (nextCart: CartDetail, customer?: CustomerOption | null) => {
      setCart(nextCart);
      setActiveCartId(nextCart._id);
      syncVoucherFromCart(nextCart);

      if (customer) {
        selectedCustomerIdRef.current = customer.id;
        setSelectedCustomer(customer);
        return;
      }

      if (selectedCustomerIdRef.current === nextCart.customer_id) {
        return;
      }

      selectedCustomerIdRef.current = nextCart.customer_id;
      setSelectedCustomer(buildCustomerOptionFromCart(nextCart));
    },
    [setActiveCartId, setSelectedCustomer, syncVoucherFromCart],
  );

  const loadCustomerDetail = useCallback(async (customerId: string | null | undefined) => {
    if (!customerId) {
      return null;
    }

    try {
      return await customerService.getCustomerById(customerId);
    } catch (error) {
      console.error("[OrderPOSReview] Failed to load customer detail", error);
      return null;
    }
  }, []);

  const hydrateCheckoutDrafts = useCallback(
    (nextCart: CartDetail, customer: CustomerOption | null) => {
      const nextCustomerId = customer?.id ?? nextCart.customer_id ?? null;

      if (reviewContactCustomerIdRef.current === nextCustomerId) {
        return;
      }

      setDraftAddress(customer?.address || nextCart.address || "");
      setDraftPhone(customer?.phone || nextCart.phone || "");
      setDraftMessage(
        reviewContactCustomerIdRef.current
          ? draftMessageRef.current
          : nextCart.message || DEFAULT_COUNTER_MESSAGE,
      );
      reviewContactCustomerIdRef.current = nextCustomerId;
      setReviewContactCustomerId(nextCustomerId);
    },
    [setDraftAddress, setDraftMessage, setDraftPhone, setReviewContactCustomerId],
  );

  const refreshCartDetail = useCallback(
    async (targetCartId: string) => {
      const nextCart = ensureCartDetail(
        await cartService.getCartDetail(targetCartId),
        "refreshCartDetail",
      );

      hydrateReviewCart(nextCart);
      return nextCart;
    },
    [ensureCartDetail, hydrateReviewCart],
  );

  const closeProductConfigurator = useCallback(() => {
    setEditingItem(null);
    closeConfigurator();
  }, [closeConfigurator]);

  const loadReviewCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);

      let nextCart: CartDetail | null = null;

      if (cartIdFromQuery) {
        nextCart = await cartService.getCartDetail(cartIdFromQuery);
      } else if (activeCartId) {
        nextCart = await cartService.getCartDetail(activeCartId);
      } else if (customerIdFromQuery) {
        nextCart = await getActiveCartUsecase(
          customerIdFromQuery,
          franchiseIdFromQuery ?? selectedAdminFranchiseId ?? undefined,
        );
      }

      if (!nextCart?._id) {
        setCart(null);
        return;
      }

      const targetCustomerId = nextCart.customer_id || customerIdFromQuery;
      const shouldRefreshCustomerDetail =
        Boolean(targetCustomerId) &&
        (selectedCustomerIdRef.current !== targetCustomerId ||
          reviewContactCustomerIdRef.current !== targetCustomerId);
      const nextCustomer = shouldRefreshCustomerDetail
        ? await loadCustomerDetail(targetCustomerId)
        : null;

      hydrateReviewCart(nextCart, nextCustomer);
      hydrateCheckoutDrafts(nextCart, nextCustomer);
    } catch (error) {
      console.error("[OrderPOSReview] Failed to load review cart", error);
      showError("Không tải được cart kiểm tra đơn");
      setCart(null);
    } finally {
      setIsLoadingCart(false);
    }
  }, [
    activeCartId,
    cartIdFromQuery,
    customerIdFromQuery,
    franchiseIdFromQuery,
    hydrateCheckoutDrafts,
    hydrateReviewCart,
    loadCustomerDetail,
    selectedAdminFranchiseId,
    showError,
  ]);

  useEffect(() => {
    void loadReviewCart();
  }, [loadReviewCart]);

  const resolvedCustomer = useMemo(() => {
    if (selectedCustomer && (!cart || selectedCustomer.id === cart.customer_id)) {
      return selectedCustomer;
    }

    if (cart) {
      return buildCustomerOptionFromCart(cart);
    }

    return null;
  }, [cart, selectedCustomer]);

  const displayItems = useMemo(() => {
    return (cart?.cart_items ?? []).map((item) => {
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
  }, [cart?.cart_items, productFranchiseLookup]);

  const productCatalogLookup = useMemo(() => {
    return products.reduce<Record<string, (typeof products)[number]>>((lookup, product) => {
      lookup[product.product_id] = product;
      return lookup;
    }, {});
  }, [products]);

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
    [openConfiguratorForEdit, resolveProductForCartItem, showError],
  );

  const applyVoucher = useCallback(async () => {
    const normalizedVoucherCode = voucherCode.trim();

    if (!cart?._id) {
      showError("Chưa có cart để áp voucher");
      return;
    }

    if (!normalizedVoucherCode) {
      showError("Vui lòng nhập mã voucher");
      return;
    }

    try {
      setIsMutatingCart(true);
      const nextCart = ensureCartDetail(
        await cartService.applyVoucher(cart._id, {
          voucher_code: normalizedVoucherCode,
        }),
        "applyVoucher",
      );

      setCart(nextCart);
      syncVoucherFromCart(nextCart);
      showSuccess("Áp dụng voucher thành công");
    } catch (error) {
      console.error("[OrderPOSReview] Failed to apply voucher", error);
      showError("Không áp dụng được voucher");
    } finally {
      setIsMutatingCart(false);
    }
  }, [cart?._id, ensureCartDetail, showError, showSuccess, syncVoucherFromCart, voucherCode]);

  const removeVoucher = useCallback(async () => {
    if (!cart?._id) {
      showError("Chưa có cart để bỏ voucher");
      return;
    }

    try {
      setIsMutatingCart(true);
      const nextCart = ensureCartDetail(await cartService.removeVoucher(cart._id), "removeVoucher");

      setCart(nextCart);
      syncVoucherFromCart(nextCart);
      showSuccess("Đã bỏ voucher khỏi cart");
    } catch (error) {
      console.error("[OrderPOSReview] Failed to remove voucher", error);
      showError("Không bỏ được voucher");
    } finally {
      setIsMutatingCart(false);
    }
  }, [cart?._id, ensureCartDetail, showError, showSuccess, syncVoucherFromCart]);

  const addOneMoreOfCartItem = useCallback(
    async (item: CartItem) => {
      if (!cart?._id) {
        return;
      }

      try {
        setIsMutatingCart(true);
        const nextCart = ensureCartDetail(
          await addCartItemsUsecase(cart.customer_id, cart.franchise_id, [
            {
              product_franchise_id: item.product_franchise_id,
              quantity: 1,
              note: item.note,
              options: item.options.map((option) => ({
                product_franchise_id: option.product_franchise_id,
                quantity: option.quantity,
              })),
            },
          ]),
          "addCartItems",
        );

        setCart(nextCart);
        syncVoucherFromCart(nextCart);
      } catch (error) {
        console.error("[OrderPOSReview] Failed to increase cart item quantity", error);
        showError("Không tăng được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [cart, ensureCartDetail, showError, syncVoucherFromCart],
  );

  const decreaseCartItemQuantity = useCallback(
    async (item: CartItem) => {
      if (!cart?._id) {
        return;
      }

      try {
        setIsMutatingCart(true);

        if (item.quantity <= 1) {
          await cartService.deleteCartItem(item.cart_item_id);
          await loadReviewCart();
        } else {
          const nextCart = ensureCartDetail(
            await cartService.updateCartItem({
              cart_item_id: item.cart_item_id,
              quantity: item.quantity - 1,
            }),
            "updateCartItem",
          );

          setCart(nextCart);
          syncVoucherFromCart(nextCart);
        }
      } catch (error) {
        console.error("[OrderPOSReview] Failed to decrease cart item quantity", error);
        showError("Không giảm được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [cart?._id, ensureCartDetail, loadReviewCart, showError, syncVoucherFromCart],
  );

  const removeCartItem = useCallback(
    async (cartItemId: string) => {
      if (!cart?._id) {
        return;
      }

      try {
        setIsMutatingCart(true);
        await cartService.deleteCartItem(cartItemId);
        await loadReviewCart();
      } catch (error) {
        console.error("[OrderPOSReview] Failed to remove cart item", error);
        showError("Không xóa được món khỏi cart");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [cart?._id, loadReviewCart, showError],
  );

  const saveEditedCartItem = useCallback(async () => {
    if (!cart?._id || !editingItem) {
      return;
    }

    const selection = buildSelection();

    if (!selection) {
      showError("Sản phẩm này chưa có size khả dụng");
      return;
    }

    const currentCartItemInput = buildStaffCartItemInputFromCartItem(editingItem);
    const nextCartItemInput = buildStaffCartItemInputFromConfiguredProduct(selection);
    const hasSameConfiguration =
      buildStaffCartItemConfigKey(currentCartItemInput) ===
      buildStaffCartItemConfigKey(nextCartItemInput);
    const hasSameQuantity = currentCartItemInput.quantity === nextCartItemInput.quantity;

    if (hasSameConfiguration && hasSameQuantity) {
      closeProductConfigurator();
      return;
    }

    const requiresReplaceLineItem =
      currentCartItemInput.product_franchise_id !== nextCartItemInput.product_franchise_id ||
      (currentCartItemInput.note ?? "") !== (nextCartItemInput.note ?? "");

    try {
      setIsMutatingCart(true);

      if (requiresReplaceLineItem) {
        let deletedOriginalItem = false;

        try {
          await cartService.deleteCartItem(editingItem.cart_item_id);
          deletedOriginalItem = true;

          const nextCart = ensureCartDetail(
            await addCartItemsUsecase(cart.customer_id, cart.franchise_id, [nextCartItemInput]),
            "replaceReviewCartItem",
          );

          hydrateReviewCart(nextCart);
        } catch (error) {
          if (deletedOriginalItem) {
            try {
              const restoredCart = await addCartItemsUsecase(cart.customer_id, cart.franchise_id, [
                currentCartItemInput,
              ]);

              if (restoredCart?._id) {
                hydrateReviewCart(restoredCart);
              }
            } catch (restoreError) {
              console.error(
                "[OrderPOSReview] Failed to restore cart item after replace error",
                restoreError,
              );
            }
          }

          throw error;
        }
      } else {
        const currentOptionsMap = new Map(
          (currentCartItemInput.options ?? []).map((option) => [
            option.product_franchise_id,
            option.quantity,
          ]),
        );
        const nextOptionsMap = new Map(
          (nextCartItemInput.options ?? []).map((option) => [option.product_franchise_id, option.quantity]),
        );
        const optionIds = new Set([...currentOptionsMap.keys(), ...nextOptionsMap.keys()]);

        const addedOptions: Array<{ product_franchise_id: string; quantity: number }> = [];
        const updatedOptions: Array<{ product_franchise_id: string; quantity: number }> = [];
        const removedOptionIds: string[] = [];

        optionIds.forEach((optionId) => {
          const currentQuantity = currentOptionsMap.get(optionId) ?? 0;
          const nextQuantity = nextOptionsMap.get(optionId) ?? 0;

          if (currentQuantity === nextQuantity) {
            return;
          }

          if (currentQuantity === 0 && nextQuantity > 0) {
            addedOptions.push({ product_franchise_id: optionId, quantity: nextQuantity });
            return;
          }

          if (currentQuantity > 0 && nextQuantity === 0) {
            removedOptionIds.push(optionId);
            return;
          }

          updatedOptions.push({ product_franchise_id: optionId, quantity: nextQuantity });
        });

        const optionsChanged =
          addedOptions.length > 0 || updatedOptions.length > 0 || removedOptionIds.length > 0;

        if (!optionsChanged && !hasSameQuantity) {
          const nextCart = ensureCartDetail(
            await cartService.updateCartItem({
              cart_item_id: editingItem.cart_item_id,
              quantity: nextCartItemInput.quantity,
            }),
            "updateReviewCartItemQuantity",
          );

          hydrateReviewCart(nextCart);
        } else {
          if (!hasSameQuantity) {
            await cartService.updateCartItem({
              cart_item_id: editingItem.cart_item_id,
              quantity: nextCartItemInput.quantity,
            });
          }

          if (addedOptions.length > 0) {
            await cartService.replaceCartItemOptions({
              cart_item_id: editingItem.cart_item_id,
              options: nextCartItemInput.options ?? [],
            });
          } else {
            for (const option of updatedOptions) {
              await cartService.updateCartItemOption({
                cart_item_id: editingItem.cart_item_id,
                option_product_franchise_id: option.product_franchise_id,
                quantity: option.quantity,
              });
            }

            for (const optionProductFranchiseId of removedOptionIds) {
              await cartService.removeCartItemOption({
                cart_item_id: editingItem.cart_item_id,
                option_product_franchise_id: optionProductFranchiseId,
              });
            }
          }

          await refreshCartDetail(cart._id);
        }
      }

      closeProductConfigurator();
      showSuccess("Đã cập nhật món trong cart");
    } catch (error) {
      console.error("[OrderPOSReview] Failed to edit cart item", error);
      showError("Không cập nhật được món trong cart");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    buildSelection,
    cart,
    closeProductConfigurator,
    editingItem,
    ensureCartDetail,
    hydrateReviewCart,
    refreshCartDetail,
    showError,
    showSuccess,
  ]);

  const checkoutCart = useCallback(async () => {
    if (!cart?._id) {
      showError("Chưa có cart để checkout");
      return;
    }

    const normalizedDraftPhone = draftPhone.trim();

    if (!normalizedDraftPhone) {
      showError("Số điện thoại đang trống, vui lòng kiểm tra lại");
      return;
    }

    try {
      setIsMutatingCart(true);
      const order = await checkoutCartUsecase(cart._id, {
        address: draftAddress.trim(),
        phone: normalizedDraftPhone,
        message: draftMessage,
      });

      if (!order?._id) {
        showError("Checkout thành công nhưng chưa lấy được order detail");
        return;
      }

      setActiveCartId(null);
      showSuccess("Checkout thành công");
      navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER}/${order._id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("[OrderPOSReview] Failed to checkout cart", error);
      showError("Checkout thất bại");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    cart?._id,
    draftAddress,
    draftMessage,
    draftPhone,
    navigate,
    setActiveCartId,
    showError,
    showSuccess,
  ]);

  const goBackToBuilder = useCallback(() => {
    navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS}`, {
      state: { preservePosSession: true },
    });
  }, [navigate]);

  const canCheckout = useMemo(() => {
    return Boolean(cart?._id && (cart.cart_items?.length ?? 0) > 0);
  }, [cart?._id, cart?.cart_items?.length]);

  const canApplyVoucher = useMemo(() => {
    return Boolean(cart?._id && voucherCode.trim() && (cart.cart_items?.length ?? 0) > 0);
  }, [cart?._id, cart?.cart_items?.length, voucherCode]);

  return {
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
    isProductConfiguratorOpen,
    productBeingConfigured,
    configuredSize,
    configuredQuantity,
    configuredNote,
    supportsToppings,
    toppingGroups,
    selectedToppings,
    configuredTotalPrice,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    setVoucherCode,
    editCartItem,
    closeProductConfigurator,
    saveEditedCartItem,
    setConfiguredSize,
    setConfiguredNote,
    increaseConfiguredQuantity,
    decreaseConfiguredQuantity,
    increaseConfiguredToppingQuantity: increaseToppingQuantity,
    decreaseConfiguredToppingQuantity: decreaseToppingQuantity,
    applyVoucher,
    removeVoucher,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
    checkoutCart,
    goBackToBuilder,
  };
};
