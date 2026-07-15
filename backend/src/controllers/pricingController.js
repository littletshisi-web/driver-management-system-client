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

const CATEGORY_SLUGS = {
  'Parcel Delivery':   'parcel_delivery',
  'Vehicle Towing':    'vehicle_towing',
  'Furniture Moving':  'furniture_moving',
};
const slugifyCategory = (category) =>
  CATEGORY_SLUGS[category] || String(category || '').toLowerCase().trim().replace(/\s+/g, '_');

const calculate = async (req, res, next) => {
  try {
    const { category, distanceKm = 0, areaModifier = 1 } = req.body;
    const config = await getOrCreate();
    const slug = slugifyCategory(category);

    const baseFee         = config.baseFees?.[slug] ?? 0;
    const ratePerKm        = config.ratesPerKm?.[slug] ?? 0;
    const categoryModifier = config.categoryModifiers?.[slug] ?? 1;
    const dist  = parseFloat(distanceKm) || 0;
    const area  = parseFloat(areaModifier) || 1;
    const distanceFee = dist * ratePerKm;
    const finalPrice  = (baseFee + distanceFee) * area * categoryModifier;

    res.json({
      success: true,
      finalPrice,
      breakdown: { baseFee, distanceFee, areaModifier: area, categoryModifier },
    });
  } catch (err) { next(err); }
};

module.exports = { getConfig, updateConfig, calculate };