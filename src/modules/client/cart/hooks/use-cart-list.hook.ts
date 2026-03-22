import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { HttpError } from '@/apis';
import { getCustomerCarts } from '@/apis/endpointsCLIENT/cart.api';
import {
  extractCartsFromPayload,
  toCartSummary,
  type CartSummaryView,
} from './cartApiMapper';

export function useCartList(userId: string | undefined, isLoggedIn: boolean) {
  const [carts, setCarts] = useState<CartSummaryView[]>([]);

  useEffect(() => {
    const loadCartFromApi = async () => {
      if (!isLoggedIn || !userId) return;

      try {
        const payload = await getCustomerCarts(userId);
        const parsedCarts = extractCartsFromPayload(payload)
          .map(toCartSummary)
          .filter((cart) => !!cart.id)
          .filter((cart) => cart.itemsCount > 0);
        setCarts(parsedCarts);
      } catch (err) {
        const errorMessage =
          err instanceof HttpError
            ? err.message
            : 'Không tải được giỏ hàng. Vui lòng thử lại.';

        toast.error('Tải giỏ hàng thất bại', { description: errorMessage, duration: 5000 });
      }
    };

    loadCartFromApi();
  }, [isLoggedIn, userId]);

  const totalItems = useMemo(
    () => carts.reduce((sum, cart) => sum + cart.itemsCount, 0),
    [carts],
  );

  const totalAmount = useMemo(
    () => carts.reduce((sum, cart) => sum + cart.totalAmount, 0),
    [carts],
  );

  const formatUpdatedAt = (value: string) => {
    if (!value) return 'Vừa cập nhật';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Vừa cập nhật';

    const diffMs = new Date().getTime() - date.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

    if (diffMinutes < 60) return `Cập nhật ${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Cập nhật ${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `Cập nhật ${diffDays} ngày trước`;
  };

  return {
    carts,
    totalItems,
    totalAmount,
    formatUpdatedAt,
  };
}
