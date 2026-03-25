import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import { cartService } from "../services/cart.service";
import { getActiveCartUsecase } from "../usecases/get-active-cart.usecase";
import { usePosSession } from "./use-pos-session";

interface OrderPosBuilderLocationState {
  preservePosSession?: boolean;
}

interface UsePosBuilderCartLifecycleOptions {
  franchiseId: string | null;
  clearCustomerResults: () => void;
  closeProductConfigurator: () => void;
}

export const usePosBuilderCartLifecycle = ({
  franchiseId,
  clearCustomerResults,
  closeProductConfigurator,
}: UsePosBuilderCartLifecycleOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError, info: showInfo } = useToast();
  const {
    selectedCustomer,
    activeCartId,
    setSelectedCustomer,
    setActiveCartId,
    setCustomerKeyword,
    resetSession,
  } = usePosSession();

  const shouldPreserveSessionOnMount = Boolean(
    (location.state as OrderPosBuilderLocationState | null)?.preservePosSession,
  );
  const skipInitialResetRef = useRef(shouldPreserveSessionOnMount);
  const latestLoadRequestRef = useRef(0);
  const selectedCustomerIdRef = useRef<string | null>(selectedCustomer?.id ?? null);

  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [isCheckingActiveCart, setIsCheckingActiveCart] = useState(false);
  const [cart, setCart] = useState<CartDetail | null>(null);

  useEffect(() => {
    selectedCustomerIdRef.current = selectedCustomer?.id ?? null;
  }, [selectedCustomer?.id]);

  const syncPersistedCartState = useCallback(
    (nextCart: CartDetail | null) => {
      setCart(nextCart);
      setActiveCartId(nextCart?._id ?? null);
    },
    [setActiveCartId],
  );

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

    resetSession();
    setCart(null);
    clearCustomerResults();
    closeProductConfigurator();
  }, [clearCustomerResults, closeProductConfigurator, franchiseId, resetSession]);

  const loadPersistedCart = useCallback(
    async (cartId: string, expectedCustomerId?: string | null) => {
      const requestId = ++latestLoadRequestRef.current;

      try {
        const nextCart = await cartService.getCartDetail(cartId);

        if (
          requestId !== latestLoadRequestRef.current ||
          (expectedCustomerId && selectedCustomerIdRef.current !== expectedCustomerId)
        ) {
          return null;
        }

        syncPersistedCartState(nextCart);
        return nextCart;
      } catch (error) {
        if (requestId !== latestLoadRequestRef.current) {
          return null;
        }

        console.error("[OrderPOS] Failed to load persisted cart", error);
        showError("Không tải được cart đang hoạt động");
        syncPersistedCartState(null);
        return null;
      }
    },
    [showError, syncPersistedCartState],
  );

  const loadCustomerActiveCart = useCallback(
    async (customer: CustomerOption) => {
      if (!franchiseId) {
        setIsCheckingActiveCart(false);
        syncPersistedCartState(null);
        return null;
      }

      const requestId = ++latestLoadRequestRef.current;

      try {
        setIsCheckingActiveCart(true);
        const activeCart = await getActiveCartUsecase(customer.id, franchiseId);

        if (
          requestId !== latestLoadRequestRef.current ||
          selectedCustomerIdRef.current !== customer.id
        ) {
          return null;
        }

        syncPersistedCartState(activeCart);
        return activeCart;
      } catch (error) {
        if (requestId !== latestLoadRequestRef.current) {
          return null;
        }

        console.error("[OrderPOS] Failed to load active cart for customer", error);
        showError("Không kiểm tra được cart hiện tại của khách hàng");
        syncPersistedCartState(null);
        return null;
      } finally {
        if (requestId === latestLoadRequestRef.current) {
          setIsCheckingActiveCart(false);
        }
      }
    },
    [franchiseId, showError, syncPersistedCartState],
  );

  useEffect(() => {
    if (!selectedCustomer) {
      latestLoadRequestRef.current += 1;
      setIsCheckingActiveCart(false);
      syncPersistedCartState(null);
      return;
    }

    if (activeCartId) {
      void loadPersistedCart(activeCartId, selectedCustomer.id);
      return;
    }

    void loadCustomerActiveCart(selectedCustomer);
  }, [
    activeCartId,
    loadCustomerActiveCart,
    loadPersistedCart,
    selectedCustomer,
    syncPersistedCartState,
  ]);

  const handleSelectCustomer = useCallback(
    (customer: CustomerOption) => {
      latestLoadRequestRef.current += 1;
      setSelectedCustomer(customer);
      setCustomerKeyword(customer.name);
      syncPersistedCartState(null);
      clearCustomerResults();
      closeProductConfigurator();
      showInfo(`Đã chọn khách hàng ${customer.name}`);
    },
    [
      clearCustomerResults,
      closeProductConfigurator,
      setCustomerKeyword,
      setSelectedCustomer,
      showInfo,
      syncPersistedCartState,
    ],
  );

  const clearSelectedCustomer = useCallback(() => {
    latestLoadRequestRef.current += 1;
    setSelectedCustomer(null);
    setCustomerKeyword("");
    setIsCheckingActiveCart(false);
    syncPersistedCartState(null);
    clearCustomerResults();
    closeProductConfigurator();
  }, [
    clearCustomerResults,
    closeProductConfigurator,
    setCustomerKeyword,
    setSelectedCustomer,
    syncPersistedCartState,
  ]);

  const continueToReview = useCallback(() => {
    const targetCartId = cart?._id ?? activeCartId;
    const targetCustomerId = selectedCustomer?.id ?? cart?.customer_id;
    const hasCartItems = (cart?.cart_items?.length ?? 0) > 0;

    if (!targetCustomerId) {
      showError("Hãy chọn khách hàng trước khi chọn món");
      return;
    }

    if (!targetCartId || !hasCartItems) {
      showError("Chưa có món nào trong giỏ hàng của khách");
      return;
    }

    goToReviewPage(targetCartId, targetCustomerId);
  }, [
    activeCartId,
    cart?._id,
    cart?.cart_items?.length,
    cart?.customer_id,
    goToReviewPage,
    selectedCustomer?.id,
    showError,
  ]);

  return {
    selectedCustomer,
    activeCartId,
    cart,
    isMutatingCart,
    isCheckingActiveCart,
    setIsMutatingCart,
    setCart,
    loadPersistedCart,
    syncPersistedCartState,
    goToReviewPage,
    selectCustomer: handleSelectCustomer,
    clearSelectedCustomer,
    continueToReview,
  };
};
