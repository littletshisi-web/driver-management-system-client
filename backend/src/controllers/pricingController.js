// src/controllers/pricingController.js
const pricingService = require('../services/pricingService');

// In-memory pricing configuration (replace with a DB model for persistence)
let pricingConfig = {
  baseFees: { parcel_delivery: 85, vehicle_towing: 650, furniture_moving: 400 },
  ratesPerKm: { parcel_delivery: 4.5, vehicle_towing: 18, furniture_moving: 10 },
  categoryModifiers: { parcel_delivery: 1.0, vehicle_towing: 1.8, furniture_moving: 1.5 },
  defaultCommissionPct: 12,
  premiumCommissionPct: 8,
  newPartnerCommissionPct: 15,
};

const calculate = (req, res) => {
  const { baseFare = 35, perKmRate = 12, distanceKm = 0 } = req.body;
  const total = pricingService.calculate(baseFare, perKmRate, distanceKm);
  res.json({ success: true, data: { baseFare, perKmRate, distanceKm, total } });
};

const getConfig = (req, res) => {
  res.json({ success: true, data: pricingConfig });
};

const updateConfig = (req, res) => {
  pricingConfig = { ...pricingConfig, ...req.body };
  res.json({ success: true, data: pricingConfig });
};

module.exports = { calculate, getConfig, updateConfig };
