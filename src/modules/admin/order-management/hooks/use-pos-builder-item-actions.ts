import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail, CartItem } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import type { PosProduct, PosProductFranchiseLookupItem } from "../models/menu.models";
import { cartService } from "../services/cart.service";
import type { PosProductCatalogSelection } from "../services/menu-catalog.service";
import {
  buildDraftCartItemFromConfiguredProduct,
  buildSelectedToppingMapFromCartItem,
  buildStaffCartItemConfigKey,
  buildStaffCartItemInputFromCartItem,
  buildStaffCartItemInputFromConfiguredProduct,
} from "../services/pos-product-config.service";
import { addCartItemsUsecase } from "../usecases/add-cart-items.usecase";
import { replaceCartItemWithRestoreUsecase } from "../usecases/replace-cart-item-with-restore.usecase";
import { usePosSession } from "./use-pos-session";

const ensureCartDetail = (nextCart: CartDetail | null, action: string) => {
  if (!nextCart?._id) {
    throw new Error(`[OrderPOS] ${action} returned an empty cart payload`);
  }

  return nextCart;
};

interface UsePosBuilderItemActionsOptions {
  franchiseId: string | null;
  cart: CartDetail | null;
  activeCartId: string | null;
  selectedCustomer: CustomerOption | null;
  hasPersistedCart: boolean;
  products: PosProduct[];
  productFranchiseLookup: Record<string, PosProductFranchiseLookupItem>;
  openConfigurator: (product: PosProduct) => void;
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
  syncPersistedCartState: (nextCart: CartDetail | null, customer?: CustomerOption | null) => void;
  loadPersistedCart: (cartId: string, customer?: CustomerOption | null) => Promise<CartDetail | null>;
  setIsMutatingCart: (value: boolean) => void;
  goToReviewPage: (cartId: string, customerId?: string) => void;
}

export const usePosBuilderItemActions = ({
  franchiseId,
  cart,
  activeCartId,
  selectedCustomer,
  hasPersistedCart,
  products,
  productFranchiseLookup,
  openConfigurator,
  openConfiguratorForEdit,
  closeConfigurator,
  buildSelection,
  syncPersistedCartState,
  loadPersistedCart,
  setIsMutatingCart,
  goToReviewPage,
}: UsePosBuilderItemActionsOptions) => {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const {
    addDraftItem,
    replaceDraftItem,
    incrementDraftItem,
    decrementDraftItem,
    removeDraftItem,
  } = usePosSession();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

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
      const targetCartId = cart?._id ?? activeCartId;

      if (hasSameConfiguration && hasSameQuantity) {
        closeProductConfigurator();
        return;
      }

      if (!targetCartId) {
        showError("Không xác định được cart để cập nhật");
        return;
      }

      try {
        setIsMutatingCart(true);

        if (hasSameConfiguration) {
          await cartService.updateCartItem({
            cart_item_id: editingItem.cart_item_id,
            quantity: nextCartItemInput.quantity,
          });

          ensureCartDetail(
            await loadPersistedCart(targetCartId, selectedCustomer),
            "refreshUpdatedCartItem",
          );
        } else {
          const nextCart = ensureCartDetail(
            await replaceCartItemWithRestoreUsecase({
              cartItemId: editingItem.cart_item_id,
              customerId: targetCustomerId,
              franchiseId,
              currentCartItemInput,
              nextCartItemInput,
            }),
            "replaceCartItem",
          );

          syncPersistedCartState(nextCart, selectedCustomer);
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
    cart?.customer_id,
    cart?._id,
    closeProductConfigurator,
    editingItem,
    ensureCanBrowsePos,
    franchiseId,
    hasPersistedCart,
    activeCartId,
    loadPersistedCart,
    replaceDraftItem,
    selectedCustomer,
    showError,
    showSuccess,
    syncPersistedCartState,
    setIsMutatingCart,
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
            ...buildStaffCartItemInputFromCartItem(item),
            quantity: 1,
          },
        ]);

        syncPersistedCartState(nextCart, selectedCustomer);
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
      showError,
      syncPersistedCartState,
      setIsMutatingCart,
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
          await cartService.updateCartItem({
            cart_item_id: item.cart_item_id,
            quantity: item.quantity - 1,
          });
          await loadPersistedCart(targetCartId, selectedCustomer);
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
      setIsMutatingCart,
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
      setIsMutatingCart,
    ],
  );

  return {
    isEditingConfiguredProduct: Boolean(editingItem),
    addProductToCart,
    editCartItem,
    closeProductConfigurator,
    confirmConfiguredProduct,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
  };
};
