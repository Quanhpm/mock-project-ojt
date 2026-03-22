import type { CartDetailView } from '../hooks/cartApiMapper';

export const formatCurrencyVnd = (amount: number): string => `${amount.toLocaleString('vi-VN')} ₫`;

export const getCartTotalDiscount = (cart: CartDetailView | null): number => {
  if (!cart) return 0;
  return (cart.promotionDiscount ?? 0) + (cart.voucherDiscount ?? 0) + (cart.loyaltyDiscount ?? 0);
};

