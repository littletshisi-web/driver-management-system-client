// currencyFormatter.js
const formatZAR = (amount) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

const formatAmount = (amount, currency = 'ZAR') =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);

module.exports = { formatZAR, formatAmount };
