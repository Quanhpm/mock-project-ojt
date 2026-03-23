import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import { cartService } from "../services/cart.service";
import { getActiveCartUsecase } from "../usecases/get-active-cart.usecase";
import { persistDraftCartUsecase } from "../usecases/persist-draft-cart.usecase";
import { usePosSession } from "./use-pos-session";

const DEFAULT_COUNTER_MESSAGE = "Mua tại quầy";

interface OrderPosBuilderLocationState {
  preservePosSession?: boolean;
}

interface UsePosBuilderCartLifecycleOptions {
  franchiseId: string | null;
  franchiseName: string;
  clearCustomerResults: () => void;
  closeProductConfigurator: () => void;
}

export const usePosBuilderCartLifecycle = ({
  franchiseId,
  franchiseName,
  clearCustomerResults,
  closeProductConfigurator,
}: UsePosBuilderCartLifecycleOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const {
    selectedCustomer,
    activeCartId,
    draftItems,
    setSelectedCustomer,
    setActiveCartId,
    setCustomerKeyword,
    setDraftItems,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    setVoucherCode,
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

  const hasPersistedCart = Boolean(activeCartId);
  const defaultCounterAddress = useMemo(() => {
    return franchiseName ? `MUA_TAI_QUAY - ${franchiseName}` : "MUA_TAI_QUAY";
  }, [franchiseName]);

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

  const syncPersistedCartState = useCallback(
    (nextCart: CartDetail | null, customer?: CustomerOption | null) => {
      setCart(nextCart);
      setExistingActiveCart(nextCart);
      setActiveCartId(nextCart?._id ?? null);
      syncDraftFieldsFromCart(nextCart, customer);
    },
    [setActiveCartId, syncDraftFieldsFromCart],
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

    resetSession({
      defaultAddress: defaultCounterAddress,
      defaultMessage: DEFAULT_COUNTER_MESSAGE,
    });
    setCart(null);
    setExistingActiveCart(null);
    setIsExistingCartModalOpen(false);
    clearCustomerResults();
    closeProductConfigurator();
  }, [
    clearCustomerResults,
    closeProductConfigurator,
    defaultCounterAddress,
    franchiseId,
    resetSession,
  ]);

  const loadPersistedCart = useCallback(
    async (cartId: string, customer?: CustomerOption | null) => {
      try {
        const nextCart = await cartService.getCartDetail(cartId);
        syncPersistedCartState(nextCart, customer);
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
    [setActiveCartId, showError, syncPersistedCartState],
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

  const persistDraftToServerCart = useCallback(
    async (customer: CustomerOption) => {
      if (!franchiseId || draftItems.length === 0) {
        return existingActiveCart;
      }

      const nextCart = await persistDraftCartUsecase(customer.id, franchiseId, draftItems);

      setDraftItems([]);
      syncPersistedCartState(nextCart, customer);
      return nextCart;
    },
    [
      draftItems,
      existingActiveCart,
      franchiseId,
      setDraftItems,
      syncPersistedCartState,
    ],
  );

  const continueWithExistingServerCart = useCallback(() => {
    if (!existingActiveCart?._id || !selectedCustomer) {
      return;
    }

    setDraftItems([]);
    syncPersistedCartState(existingActiveCart, selectedCustomer);
    setIsExistingCartModalOpen(false);
    goToReviewPage(existingActiveCart._id, selectedCustomer.id);
  }, [
    existingActiveCart,
    goToReviewPage,
    selectedCustomer,
    setDraftItems,
    syncPersistedCartState,
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
  }, [
    existingActiveCart?._id,
    goToReviewPage,
    persistDraftToServerCart,
    selectedCustomer,
    showError,
    showSuccess,
  ]);

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

  return {
    selectedCustomer,
    activeCartId,
    draftItems,
    cart,
    existingActiveCart,
    isMutatingCart,
    isCheckingActiveCart,
    isExistingCartModalOpen,
    hasPersistedCart,
    setIsMutatingCart,
    setCart,
    setExistingActiveCart,
    loadPersistedCart,
    syncDraftFieldsFromCart,
    syncPersistedCartState,
    goToReviewPage,
    selectCustomer: handleSelectCustomer,
    clearSelectedCustomer,
    continueToReview,
    mergeDraftIntoExistingCart,
    closeExistingCartModal: () => setIsExistingCartModalOpen(false),
    useExistingServerCart: continueWithExistingServerCart,
  };
};
