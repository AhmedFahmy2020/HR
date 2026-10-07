// Centralized currency formatting for the HR platform.
// The platform operates in UAE Dirhams (AED).
export const CURRENCY_CODE = 'AED';

/**
 * Format a numeric amount as an AED currency string, e.g. 12500 -> "AED 12,500".
 * Amounts are rounded to whole dirhams for display.
 */
export const formatMoney = (amount: number): string => {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${CURRENCY_CODE} ${Math.round(safe).toLocaleString('en-AE')}`;
};
