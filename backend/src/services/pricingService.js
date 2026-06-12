// src/services/pricingService.js
const calculate = (baseFare, perKmRate, distanceKm) =>
  parseFloat((parseFloat(baseFare) + parseFloat(perKmRate) * parseFloat(distanceKm)).toFixed(2));

const getDefaults = () => ({ baseFare: 35, perKmRate: 12 });

module.exports = { calculate, getDefaults };
