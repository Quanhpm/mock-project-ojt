import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import type { CartDetail } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";
import { cartService } from "../services/cart.service";
import { customerService } from "../services/customer.service";
import { resolveProductSizeLabel } from "../services/menu-catalog.service";
import { loadPosReviewCartUsecase } from "../usecases/load-pos-review-cart.usecase";
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
  const [searchParams] = useSearchParams();
  const { error: showError } = useToast();
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
  const selectedCustomerIdRef = useRef<string | null>(selectedCustomer?.id ?? null);
  const reviewContactCustomerIdRef = useRef<string | null>(reviewContactCustomerId);
  const draftMessageRef = useRef(draftMessage);

  const cartIdFromQuery = searchParams.get("cartId");
  const customerIdFromQuery = searchParams.get("customerId");
  const franchiseIdFromQuery = searchParams.get("franchiseId");
  const { products, toppingProducts, productFranchiseLookup } = usePosMenuData(
    cart?.franchise_id ?? null,
  );

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

  const loadReviewCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);

      const nextCart = await loadPosReviewCartUsecase({
        cartId: cartIdFromQuery,
        activeCartId,
        customerId: customerIdFromQuery,
        franchiseId: franchiseIdFromQuery,
        selectedAdminFranchiseId,
      });

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

  return {
    cart,
    setCart,
    resolvedCustomer,
    displayItems,
    draftAddress,
    draftPhone,
    draftMessage,
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
    refreshCartDetail,
    loadReviewCart,
  };
};
