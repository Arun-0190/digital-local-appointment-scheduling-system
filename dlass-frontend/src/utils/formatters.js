/**
 * Formats a number as INR currency (e.g., ₹1,200.00)
 * @param {number} amount - The numeric amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrencyINR = (amount) => {
  if (amount === undefined || amount === null) return "₹0.00";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
