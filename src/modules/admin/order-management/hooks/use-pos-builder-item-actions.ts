import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail, CartItem } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import type { PosProduct } from "../models/menu.models";
import { cartService } from "../services/cart.service";
import type { PosProductCatalogSelection } from "../services/menu-catalog.service";
import {
  buildStaffCartItemInputFromCartItem,
  buildStaffCartItemInputFromConfiguredProduct,
} from "../services/pos-product-config.service";
import { addCartItemsUsecase } from "../usecases/add-cart-items.usecase";

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
  openConfigurator: (product: PosProduct) => void;
  closeConfigurator: () => void;
  buildSelection: () => PosProductCatalogSelection | null;
  syncPersistedCartState: (nextCart: CartDetail | null) => void;
  loadPersistedCart: (cartId: string, expectedCustomerId?: string | null) => Promise<CartDetail | null>;
  setIsMutatingCart: (value: boolean) => void;
  goToReviewPage: (cartId: string, customerId?: string) => void;
}

export const usePosBuilderItemActions = ({
  franchiseId,
  cart,
  activeCartId,
  selectedCustomer,
  openConfigurator,
  closeConfigurator,
  buildSelection,
  syncPersistedCartState,
  loadPersistedCart,
  setIsMutatingCart,
  goToReviewPage,
}: UsePosBuilderItemActionsOptions) => {
  const { error: showError, info: showInfo } = useToast();

  const ensureCanBrowsePos = useCallback(() => {
    if (!franchiseId) {
      showError("Bạn cần chọn chi nhánh trước khi bán hàng");
      return false;
    }

    if (!selectedCustomer?.id) {
      showError("Hãy chọn khách hàng trước khi chọn món");
      return false;
    }

    return true;
  }, [franchiseId, selectedCustomer?.id, showError]);

  const closeProductConfigurator = useCallback(() => {
    closeConfigurator();
  }, [closeConfigurator]);

  const addProductToCart = useCallback(
    (product: PosProduct) => {
      if (!ensureCanBrowsePos()) {
        return;
      }

      openConfigurator(product);
    },
    [ensureCanBrowsePos, openConfigurator],
  );

  const editCartItem = useCallback(
    () => {
      const targetCartId = cart?._id ?? activeCartId;
      const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;

      if (!targetCartId || !targetCustomerId) {
        showError("Không xác định được cart active để sang bước kiểm tra đơn");
        return;
      }

      showInfo("Món trong cart active sẽ được chỉnh ở bước kiểm tra đơn");
      goToReviewPage(targetCartId, targetCustomerId);
    },
    [
      activeCartId,
      cart?._id,
      cart?.customer_id,
      goToReviewPage,
      selectedCustomer?.id,
      showError,
      showInfo,
    ],
  );

  const confirmConfiguredProduct = useCallback(async () => {
    if (!ensureCanBrowsePos() || !franchiseId || !selectedCustomer?.id) {
      return;
    }

    const selection = buildSelection();

    if (!selection) {
      showError("Sản phẩm này chưa có size khả dụng");
      return;
    }

    const nextCartItemInput = buildStaffCartItemInputFromConfiguredProduct(selection);

    try {
      setIsMutatingCart(true);
      const nextCart = ensureCartDetail(
        await addCartItemsUsecase(selectedCustomer.id, franchiseId, [nextCartItemInput]),
        "addConfiguredProduct",
      );

      syncPersistedCartState(nextCart);
      closeProductConfigurator();
    } catch (error) {
      console.error("[OrderPOS] Failed to add configured product", error);
      showError("Không thêm được món vào cart");
    } finally {
      setIsMutatingCart(false);
    }
  }, [
    buildSelection,
    closeProductConfigurator,
    ensureCanBrowsePos,
    franchiseId,
    selectedCustomer?.id,
    setIsMutatingCart,
    showError,
    syncPersistedCartState,
  ]);

  const addOneMoreOfCartItem = useCallback(
    async (item: CartItem) => {
      const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;

      if (!targetCustomerId || !franchiseId) {
        showError("Không xác định được customer để cập nhật cart");
        return;
      }

      try {
        setIsMutatingCart(true);
        const nextCart = ensureCartDetail(
          await addCartItemsUsecase(targetCustomerId, franchiseId, [
            {
              ...buildStaffCartItemInputFromCartItem(item),
              quantity: 1,
            },
          ]),
          "addQuantity",
        );

        syncPersistedCartState(nextCart);
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
      selectedCustomer?.id,
      setIsMutatingCart,
      showError,
      syncPersistedCartState,
    ],
  );

  const decreaseCartItemQuantity = useCallback(
    async (item: CartItem) => {
      const targetCartId = cart?._id ?? activeCartId;
      const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;

      if (!targetCartId) {
        showError("Không xác định được cart để cập nhật");
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

        await loadPersistedCart(targetCartId, targetCustomerId);
      } catch (error) {
        console.error("[OrderPOS] Failed to decrease cart item quantity", error);
        showError("Không giảm được số lượng món");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      activeCartId,
      cart?.customer_id,
      cart?._id,
      loadPersistedCart,
      selectedCustomer?.id,
      setIsMutatingCart,
      showError,
    ],
  );

  const removeCartItem = useCallback(
    async (cartItemId: string) => {
      const targetCartId = cart?._id ?? activeCartId;
      const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;

      if (!targetCartId) {
        showError("Không xác định được cart để cập nhật");
        return;
      }

      try {
        setIsMutatingCart(true);
        await cartService.deleteCartItem(cartItemId);
        await loadPersistedCart(targetCartId, targetCustomerId);
      } catch (error) {
        console.error("[OrderPOS] Failed to remove cart item", error);
        showError("Không xóa được món khỏi cart");
      } finally {
        setIsMutatingCart(false);
      }
    },
    [
      activeCartId,
      cart?.customer_id,
      cart?._id,
      loadPersistedCart,
      selectedCustomer?.id,
      setIsMutatingCart,
      showError,
    ],
  );

  return {
    isEditingConfiguredProduct: false,
    addProductToCart,
    editCartItem,
    closeProductConfigurator,
    confirmConfiguredProduct,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
  };
};
