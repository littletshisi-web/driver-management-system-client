// src/controllers/pricingController.js
const pricingService = require('../services/pricingService');

const calculate = (req, res) => {
  const { baseFare = 35, perKmRate = 12, distanceKm = 0 } = req.body;
  const total = pricingService.calculate(baseFare, perKmRate, distanceKm);
  res.json({ success: true, data: { baseFare, perKmRate, distanceKm, total } });
};

const getConfig = (req, res) => {
  res.json({ success: true, data: pricingService.getDefaults() });
};

module.exports = { calculate, getConfig };
