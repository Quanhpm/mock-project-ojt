import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ROUTER_URL } from '@/routes/router.const';
import { useCartDetail } from './use-cart-detail.hook';
import { useCheckoutHandler } from './use-checkout-handler.hook';
import { formatCurrencyVnd, getCartTotalDiscount } from '../services/cartDetail.service';

export function useCartDetailPage() {
  const navigate = useNavigate();
  const { cartId = '' } = useParams<{ cartId: string }>();
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [isCancelCartConfirmOpen, setIsCancelCartConfirmOpen] = useState(false);

  const cartDetail = useCartDetail(cartId);
  const { handleCheckout: runCheckout, getCheckoutPrefill } = useCheckoutHandler(cartId);

  const totalDiscount = useMemo(() => getCartTotalDiscount(cartDetail.cart), [cartDetail.cart]);

  const goToCartList = useCallback(() => {
    navigate(ROUTER_URL.HOME_ROUTER.CART);
  }, [navigate]);

  const goToMenu = useCallback(() => {
    navigate(ROUTER_URL.MENU);
  }, [navigate]);

  const openDeleteConfirm = useCallback((itemId: string) => {
    setPendingDeleteItemId(itemId);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (cartDetail.isDeleting) return;
    setPendingDeleteItemId(null);
  }, [cartDetail.isDeleting]);

  const confirmDeleteItem = useCallback(async () => {
    if (!pendingDeleteItemId) return;
    const didDelete = await cartDetail.handleDeleteItem(pendingDeleteItemId);
    if (!didDelete) return;
    setPendingDeleteItemId(null);
  }, [cartDetail, pendingDeleteItemId]);

  const openCancelCartConfirm = useCallback(() => {
    if (cartDetail.isCancellingCart) return;
    setIsCancelCartConfirmOpen(true);
  }, [cartDetail.isCancellingCart]);

  const closeCancelCartConfirm = useCallback(() => {
    if (cartDetail.isCancellingCart) return;
    setIsCancelCartConfirmOpen(false);
  }, [cartDetail.isCancellingCart]);

  const confirmCancelCart = useCallback(async () => {
    const didCancel = await cartDetail.handleCancelCart();
    if (!didCancel) return;
    setIsCancelCartConfirmOpen(false);
    goToCartList();
  }, [cartDetail, goToCartList]);

  const handleCheckout = useCallback(async (payload: { address: string; phone: string; message?: string }) => {
    if (cartDetail.hasPendingQuantityChanges) {
      toast.error('Bạn có thay đổi số lượng chưa lưu', {
        description: 'Vui lòng bấm "Lưu số lượng" trước khi thanh toán.',
      });
      return false;
    }

    return runCheckout(payload);
  }, [cartDetail.hasPendingQuantityChanges, runCheckout]);

  return {
    ...cartDetail,
    cartId,
    formatCurrency: formatCurrencyVnd,
    totalDiscount,
    handleCheckout,
    getCheckoutPrefill,
    goToCartList,
    goToMenu,
    pendingDeleteItemId,
    isCancelCartConfirmOpen,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDeleteItem,
    openCancelCartConfirm,
    closeCancelCartConfirm,
    confirmCancelCart,
  };
}
