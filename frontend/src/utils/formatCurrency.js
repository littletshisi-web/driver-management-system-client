/**
 * Formats a number as South African Rand.
 * e.g. formatCurrency(1234.5) → "R 1,234.50"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return 'R ' + Number(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
