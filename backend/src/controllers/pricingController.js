// src/controllers/pricingController.js
const PricingConfig  = require('../models/PricingConfig');
const pricingService = require('../services/pricingService');

const DEFAULTS = {
  baseFees:               { parcel_delivery: 0, vehicle_towing: 0, furniture_moving: 0 },
  ratesPerKm:             { parcel_delivery: 0, vehicle_towing: 0, furniture_moving: 0 },
  categoryModifiers:      { parcel_delivery: 1.0, vehicle_towing: 1.0, furniture_moving: 1.0 },
  defaultCommissionPct:    0,
  premiumCommissionPct:    0,
  newPartnerCommissionPct: 0,
};

// Retrieve the singleton config row, creating it with defaults if it doesn't exist yet.
const getOrCreate = async () => {
  const [config] = await PricingConfig.findOrCreate({
    where: { id: 1 },
    defaults: { id: 1, ...DEFAULTS },
  });
  return config;
};

const getConfig = async (req, res, next) => {
  try {
    const config = await getOrCreate();
    res.json({ success: true, data: config });
  } catch (err) { next(err); }
};

const updateConfig = async (req, res, next) => {
  try {
    const config = await getOrCreate();
    await config.update(req.body);
    res.json({ success: true, data: config });
  } catch (err) { next(err); }
};

const calculate = (req, res) => {
  const { baseFare = 35, perKmRate = 12, distanceKm = 0 } = req.body;
  const total = pricingService.calculate(baseFare, perKmRate, distanceKm);
  res.json({ success: true, data: { baseFare, perKmRate, distanceKm, total } });
};

module.exports = { getConfig, updateConfig, calculate };