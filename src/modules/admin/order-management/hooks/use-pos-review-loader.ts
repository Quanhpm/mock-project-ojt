import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import {
  getRoleCode,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type { CartDetail } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import { cartService } from "../services/cart.service";
import { customerService } from "../services/customer.service";
import { resolveProductSizeLabel } from "../services/menu-catalog.service";
import { loadPosReviewCartUsecase } from "../usecases/load-pos-review-cart.usecase";
import { useAdminGlobalFranchiseScope } from "./use-admin-global-franchise-scope";
import { usePosMenuData } from "./use-pos-menu-data";
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

export const usePosReviewLoader = () => {
  const { error: showError } = useToast();
  const authStore = useAdminAuthStore();
  const activeContext = useAdminAuthStore((state) => state.activeContext);
  const roleCode = getRoleCode(authStore);
  const {
    sessionFranchiseId,
    selectedCustomer,
    activeCartId,
    setSelectedCustomer,
    setActiveCartId,
    setSessionFranchiseId,
  } = usePosSession();
  const isAdminGlobalMode =
    roleCode === "ADMIN" &&
    activeContext?.scope === "GLOBAL" &&
    !activeContext?.franchise_id;
  const { franchiseId: adminGlobalFranchiseId } = useAdminGlobalFranchiseScope({
    enabled: isAdminGlobalMode,
    scopeKey: "order-pos",
  });

  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [cart, setCart] = useState<CartDetail | null>(null);
  const [draftAddressState, setDraftAddressState] = useState("");
  const [draftPhoneState, setDraftPhoneState] = useState("");
  const [draftMessageState, setDraftMessageState] = useState(DEFAULT_COUNTER_MESSAGE);
  const [voucherCode, setVoucherCode] = useState("");

  const selectedCustomerIdRef = useRef<string | null>(selectedCustomer?.id ?? null);
  const isDraftAddressDirtyRef = useRef(false);
  const isDraftPhoneDirtyRef = useRef(false);
  const isDraftMessageDirtyRef = useRef(false);

  const resolvedCustomerId = selectedCustomer?.id ?? null;
  const resolvedReviewFranchiseId =
    isAdminGlobalMode ? adminGlobalFranchiseId : sessionFranchiseId;
  const { products, toppingProducts, productFranchiseLookup } = usePosMenuData(
    cart?.franchise_id ?? null,
  );

  useEffect(() => {
    selectedCustomerIdRef.current = selectedCustomer?.id ?? null;
  }, [selectedCustomer?.id]);

  const ensureCartDetail = useCallback((nextCart: CartDetail | null, action: string) => {
    if (!nextCart?._id) {
      throw new Error(`[OrderPOSReview] ${action} returned an empty cart payload`);
    }

    return nextCart;
  }, []);

  const syncVoucherFromCart = useCallback((nextCart: CartDetail) => {
    setVoucherCode(nextCart.voucher_code || "");
  }, []);

  const setDraftAddress = useCallback((value: string) => {
    isDraftAddressDirtyRef.current = true;
    setDraftAddressState(value);
  }, []);

  const setDraftPhone = useCallback((value: string) => {
    isDraftPhoneDirtyRef.current = true;
    setDraftPhoneState(value);
  }, []);

  const setDraftMessage = useCallback((value: string) => {
    isDraftMessageDirtyRef.current = true;
    setDraftMessageState(value);
  }, []);

  const hydrateReviewCart = useCallback(
    (nextCart: CartDetail, customer?: CustomerOption | null) => {
      setCart(nextCart);
      setActiveCartId(nextCart._id);
      setSessionFranchiseId(nextCart.franchise_id || null);

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
    [setActiveCartId, setSelectedCustomer, setSessionFranchiseId],
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

  const syncCheckoutDraftsFromCart = useCallback(
    (
      nextCart: CartDetail,
      customer: CustomerOption | null,
      options: { force?: boolean } = {},
    ) => {
      const { force = false } = options;
      const nextAddress = customer?.address || nextCart.address || "";
      const nextPhone = customer?.phone || nextCart.phone || "";
      const nextMessage = nextCart.message || DEFAULT_COUNTER_MESSAGE;

      if (force || !isDraftAddressDirtyRef.current) {
        setDraftAddressState(nextAddress);
        isDraftAddressDirtyRef.current = false;
      }

      if (force || !isDraftPhoneDirtyRef.current) {
        setDraftPhoneState(nextPhone);
        isDraftPhoneDirtyRef.current = false;
      }

      if (force || !isDraftMessageDirtyRef.current) {
        setDraftMessageState(nextMessage);
        isDraftMessageDirtyRef.current = false;
      }

      setVoucherCode(nextCart.voucher_code || "");
    },
    [],
  );

  const refreshCartDetail = useCallback(
    async (targetCartId: string) => {
      const nextCart = ensureCartDetail(
        await cartService.getCartDetail(targetCartId),
        "refreshCartDetail",
      );
      const nextCustomer =
        selectedCustomer?.id === nextCart.customer_id ? selectedCustomer : null;

      hydrateReviewCart(nextCart);
      syncCheckoutDraftsFromCart(nextCart, nextCustomer);
      return nextCart;
    },
    [ensureCartDetail, hydrateReviewCart, selectedCustomer, syncCheckoutDraftsFromCart],
  );

  const loadReviewCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);

      if (!resolvedReviewFranchiseId) {
        isDraftAddressDirtyRef.current = false;
        isDraftPhoneDirtyRef.current = false;
        isDraftMessageDirtyRef.current = false;
        setCart(null);
        setActiveCartId(null);
        return;
      }

      const nextCart = await loadPosReviewCartUsecase({
        activeCartId,
        customerId: resolvedCustomerId,
        franchiseId: resolvedReviewFranchiseId,
      });

      if (!nextCart?._id) {
        isDraftAddressDirtyRef.current = false;
        isDraftPhoneDirtyRef.current = false;
        isDraftMessageDirtyRef.current = false;
        setCart(null);
        setActiveCartId(null);
        return;
      }

      const targetCustomerId = nextCart.customer_id || resolvedCustomerId;
      const shouldRefreshCustomerDetail =
        Boolean(targetCustomerId) && selectedCustomerIdRef.current !== targetCustomerId;
      const nextCustomer = shouldRefreshCustomerDetail
        ? await loadCustomerDetail(targetCustomerId)
        : selectedCustomer?.id === targetCustomerId
          ? selectedCustomer
          : null;

      hydrateReviewCart(nextCart, nextCustomer);
      syncCheckoutDraftsFromCart(nextCart, nextCustomer);
    } catch (error) {
      console.error("[OrderPOSReview] Failed to load review cart", error);
      showError("Không tải được cart kiểm tra đơn");
      setCart(null);
    } finally {
      setIsLoadingCart(false);
    }
  }, [
    activeCartId,
    hydrateReviewCart,
    loadCustomerDetail,
    resolvedReviewFranchiseId,
    resolvedCustomerId,
    selectedCustomer,
    setActiveCartId,
    showError,
    syncCheckoutDraftsFromCart,
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

  return {
    cart,
    setCart,
    resolvedCustomer,
    displayItems,
    draftAddress: draftAddressState,
    draftPhone: draftPhoneState,
    draftMessage: draftMessageState,
    voucherCode,
    isLoadingCart,
    isMutatingCart,
    setIsMutatingCart,
    products,
    toppingProducts,
    productFranchiseLookup,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    setVoucherCode,
    setActiveCartId,
    ensureCartDetail,
    hydrateReviewCart,
    syncVoucherFromCart,
    syncCheckoutDraftsFromCart,
    refreshCartDetail,
    loadReviewCart,
  };
};
