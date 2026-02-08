/**
 * Format number to Vietnamese currency
 * @param amount - Amount in VND
 * @returns Formatted currency string (e.g., "125.000đ")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

/**
 * Format number to shortened Vietnamese currency (for large amounts)
 * @param amount - Amount in VND
 * @returns Formatted currency string (e.g., "2.450k")
 */
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'k';
  }
  return amount.toString() + 'đ';
};
