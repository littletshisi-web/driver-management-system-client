import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// GET /api/pricing/rules
// Response: { baseFees, ratesPerKm, categoryModifiers, defaultCommissionPct, ... }
export const getPricingRules = () =>
  api.get(API.PRICING_RULES);

// PUT /api/pricing/rules
// Body: Full pricing rules object (same shape as GET response).
// Response: { data: PricingRules }
export const updatePricingRules = (data) =>
  api.put(API.PRICING_RULES, data);

// POST /api/pricing/calculate
// Body: { category, distanceKm, areaId }
// Response: { finalPrice: number, breakdown: { baseFee, distanceFee, areaModifier, categoryModifier } }
export const calculatePrice = (payload) =>
  api.post(API.PRICING_CALCULATE, payload);
