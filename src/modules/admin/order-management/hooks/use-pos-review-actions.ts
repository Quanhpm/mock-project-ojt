import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail, CartItem } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import type { PosProduct, PosProductFranchiseLookupItem } from "../models/menu.models";
import type { PosProductCatalogSelection } from "../services/menu-catalog.service";
import { cartService } from "../services/cart.service";
import {
  buildSelectedToppingMapFromCartItem,
  buildStaffCartItemConfigKey,
  buildStaffCartItemInputFromCartItem,
  buildStaffCartItemInputFromConfiguredProduct,
} from "../services/pos-product-config.service";
import { addCartItemsUsecase } from "../usecases/add-cart-items.usecase";
import { checkoutCartUsecase } from "../usecases/checkout-cart.usecase";
import { replaceCartItemWithRestoreUsecase } from "../usecases/replace-cart-item-with-restore.usecase";
import { useAdminGlobalFranchiseScopeStore } from "../stores/admin-global-franchise-scope.store";
import { useOrderListUiStore } from "../stores/order-list-ui.store";
import { usePosSession } from "./use-pos-session";

interface UsePosReviewActionsOptions {
  cart: CartDetail | null;
  setCart: (nextCart: CartDetail | null) => void;
  draftAddress: string;
  draftPhone: string;
  draftMessage: string;
  voucherCode: string;
  setActiveCartId: (cartId: string | null) => void;
  setIsMutatingCart: (value: boolean) => void;
  ensureCartDetail: (nextCart: CartDetail | null, action: string) => CartDetail;
  hydrateReviewCart: (nextCart: CartDetail, customer?: CustomerOption | null) => void;
  syncVoucherFromCart: (nextCart: CartDetail) => void;
  syncCheckoutDraftsFromCart: (
    nextCart: CartDetail,
    customer: CustomerOption | null,
    options?: { force?: boolean },
  ) => void;
  refreshCartDetail: (targetCartId: string) => Promise<CartDetail>;
  loadReviewCart: () => Promise<void>;
  products: PosProduct[];
  productFranchiseLookup: Record<string, PosProductFranchiseLookupItem>;
  openConfiguratorForEdit: (
    product: PosProduct,
    initialState: {
      selectedSizeId?: string;
      quantity?: number;
      note?: string;
      selectedToppings?: Record<string, number>;
    },
  ) => void;
  closeConfigurator: () => void;
  buildSelection: () => PosProductCatalogSelection | null;
}

export const usePosReviewActions = ({
  cart,
  setCart,
  draftAddress,
  draftPhone,
  draftMessage,
  voucherCode,
  setActiveCartId,
  setIsMutatingCart,
  ensureCartDetail,
  hydrateReviewCart,
  syncVoucherFromCart,
  syncCheckoutDraftsFromCart,
  refreshCartDetail,
  loadReviewCart,
  products,
  productFranchiseLookup,
  openConfiguratorForEdit,
  closeConfigurator,
  buildSelection,
}: UsePosReviewActionsOptions) => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const { resetSession } = usePosSession();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);

  const productCatalogLookup = useMemo<Record<string, PosProduct>>(() => {
    return products.reduce<Record<string, PosProduct>>((lookup, product) => {
      lookup[product.product_id] = product;
      return lookup;
    }, {});
  }, [products]);

  const closeProductConfigurator = useCallback(() => {
    setEditingItem(null);
    closeConfigurator();
  }, [closeConfigurator]);

  const saveCartInfo = useCallback(
    async ({ silent = true }: { silent?: boolean } = {}) => {
      if (!cart?._id) {
        return null;
      }

      try {
        setIsMutatingCart(true);
        const nextCart = ensureCartDetail(
          await cartService.updateCart(cart._id, {
            address: draftAddress.trim(),
            phone: draftPhone.trim(),
            message: draftMessage,
          }),
          "updateCart",
        );

        hydrateReviewCart(nextCart);
        syncCheckoutDraftsFromCart(nextCart, null, { force: true });

        if (!silent) {
          showSuccess("Đã lưu thông tin cart");
        }

        return nextCart;
      } catch (error) {
        console.error("[OrderPOSReview] Failed to save cart info", error);

        if (!silent) {
          showError("Không lưu được thông tin cart");
        }

        return null;
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      cart?._id,
      draftAddress,
      draftMessage,
      draftPhone,
      ensureCartDetail,
      hydrateReviewCart,
      setIsMutatingCart,
      showError,
      showSuccess,
      syncCheckoutDraftsFromCart,
    ],
  );

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
      syncCheckoutDraftsFromCart(nextCart, null);
      showSuccess("Áp dụng voucher thành công");
    } catch (error) {
      console.error("[OrderPOSReview] Failed to apply voucher", error);
      showError("Không áp dụng được voucher");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    cart?._id,
    ensureCartDetail,
    setCart,
    setIsMutatingCart,
    showError,
    showSuccess,
    syncCheckoutDraftsFromCart,
    syncVoucherFromCart,
    voucherCode,
  ]);

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
      syncCheckoutDraftsFromCart(nextCart, null);
      showSuccess("Đã bỏ voucher khỏi cart");
    } catch (error) {
      console.error("[OrderPOSReview] Failed to remove voucher", error);
      showError("Không bỏ được voucher");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    cart?._id,
    ensureCartDetail,
    setCart,
    setIsMutatingCart,
    showError,
    showSuccess,
    syncCheckoutDraftsFromCart,
    syncVoucherFromCart,
  ]);

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
              ...buildStaffCartItemInputFromCartItem(item),
              quantity: 1,
            },
          ]),
          "addCartItems",
        );

        setCart(nextCart);
        syncVoucherFromCart(nextCart);
        syncCheckoutDraftsFromCart(nextCart, null);
      } catch (error) {
        console.error("[OrderPOSReview] Failed to increase cart item quantity", error);
        showError("Không tăng được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      cart,
      ensureCartDetail,
      setCart,
      setIsMutatingCart,
      showError,
      syncCheckoutDraftsFromCart,
      syncVoucherFromCart,
    ],
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
          await cartService.updateCartItem({
            cart_item_id: item.cart_item_id,
            quantity: item.quantity - 1,
          });
          await refreshCartDetail(cart._id);
        }
      } catch (error) {
        console.error("[OrderPOSReview] Failed to decrease cart item quantity", error);
        showError("Không giảm được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [cart?._id, loadReviewCart, refreshCartDetail, setIsMutatingCart, showError],
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
    [cart?._id, loadReviewCart, setIsMutatingCart, showError],
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
        const nextCart = ensureCartDetail(
          await replaceCartItemWithRestoreUsecase({
            cartItemId: editingItem.cart_item_id,
            customerId: cart.customer_id,
            franchiseId: cart.franchise_id,
            currentCartItemInput,
            nextCartItemInput,
          }),
          "replaceReviewCartItem",
        );

        hydrateReviewCart(nextCart);
        syncCheckoutDraftsFromCart(nextCart, null);
      } else {
        const currentOptionsMap = new Map(
          (currentCartItemInput.options ?? []).map((option) => [
            option.product_franchise_id,
            option.quantity,
          ]),
        );
        const nextOptionsMap = new Map(
          (nextCartItemInput.options ?? []).map((option) => [
            option.product_franchise_id,
            option.quantity,
          ]),
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
          await cartService.updateCartItem({
            cart_item_id: editingItem.cart_item_id,
            quantity: nextCartItemInput.quantity,
          });
          await refreshCartDetail(cart._id);
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
    setIsMutatingCart,
    showError,
    showSuccess,
    syncCheckoutDraftsFromCart,
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

      setActiveCartId(null);

      if (order?._id) {
        showSuccess("Checkout thành công");
        navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER}/${order._id}`, {
          replace: true,
        });
        return;
      }

      try {
        setIsMutatingCart(true);
        const order = await checkoutCartUsecase(cart._id, payload);
        const completedFranchiseId = cart.franchise_id || null;

        setActiveCartId(null);

        if (completedFranchiseId) {
          useAdminGlobalFranchiseScopeStore
            .getState()
            .setSelectedFranchiseId("orders", completedFranchiseId);
        }

        if (order?._id) {
          useOrderListUiStore.getState().openOrderDetail(order._id);
          showSuccess("Checkout thành công");
          navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER}`, {
            replace: true,
          });
          return true;
        }

        showSuccess("Checkout thành công, đơn hàng đang được đồng bộ");
        navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER}`, {
          replace: true,
        });
        return true;
      } catch (error) {
        console.error("[OrderPOSReview] Failed to checkout cart", error);
        showError("Checkout thất bại");
        return false;
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      cart?._id,
      cart?.franchise_id,
      navigate,
      setActiveCartId,
      setIsMutatingCart,
      showError,
      showSuccess,
    ],
  );

  const openCancelCurrentOrderModal = useCallback(() => {
    if (!cart?._id) {
      return;
    }

    setIsCancelOrderModalOpen(true);
  }, [cart?._id]);

  const closeCancelCurrentOrderModal = useCallback(() => {
    setIsCancelOrderModalOpen(false);
  }, []);

  const confirmCancelCurrentOrder = useCallback(async () => {
    if (!cart?._id) {
      setIsCancelOrderModalOpen(false);
      return;
    }

    try {
      setIsMutatingCart(true);
      await cartService.cancelCart(cart._id);
      if (cart.franchise_id) {
        useAdminGlobalFranchiseScopeStore
          .getState()
          .setSelectedFranchiseId("order-pos", cart.franchise_id);
      }
      setCart(null);
      setActiveCartId(null);
      resetSession();
      closeProductConfigurator();
      closeCancelCurrentOrderModal();
      showSuccess("Đã hủy giỏ hàng hiện tại");
      navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS}`, {
        replace: true,
      });
    } catch (error) {
      console.error("[OrderPOSReview] Failed to cancel current cart", error);
      showError("Không xóa được giỏ hàng hiện tại");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    cart?._id,
    closeCancelCurrentOrderModal,
    closeProductConfigurator,
    navigate,
    resetSession,
    setActiveCartId,
    setCart,
    setIsMutatingCart,
    showError,
    showSuccess,
  ]);

  const canCheckout = useMemo(() => {
    return Boolean(cart?._id && (cart.cart_items?.length ?? 0) > 0);
  }, [cart?._id, cart?.cart_items?.length]);

  const canApplyVoucher = useMemo(() => {
    return Boolean(cart?._id && voucherCode.trim() && (cart.cart_items?.length ?? 0) > 0);
  }, [cart?._id, cart?.cart_items?.length, voucherCode]);

  return {
    isCancelOrderModalOpen,
    canCheckout,
    canApplyVoucher,
    editCartItem,
    closeProductConfigurator,
    saveCartInfo,
    openCancelCurrentOrderModal,
    closeCancelCurrentOrderModal,
    applyVoucher,
    removeVoucher,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
    saveEditedCartItem,
    checkoutCart,
    confirmCancelCurrentOrder,
  };
};
