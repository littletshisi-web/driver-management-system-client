// src/validators/taskValidator.js
const Joi = require('joi');

const createTaskSchema = Joi.object({
  category:       Joi.string().valid('parcel_delivery', 'vehicle_towing', 'furniture_moving').required(),
  type:           Joi.string().valid('food', 'parcels', 'grocery', 'other'), // kept for backward compat
  driverId:       Joi.string().uuid(),
  partnerId:      Joi.string().uuid(),
  areaId:         Joi.string().uuid(),
  pickupAddress:  Joi.string().required(),
  pickupLat:      Joi.number(),
  pickupLng:      Joi.number(),
  dropoffAddress: Joi.string().required(),
  dropoffLat:     Joi.number(),
  dropoffLng:     Joi.number(),
  distanceKm:     Joi.number().min(0),
  baseFare:       Joi.number().min(0),
  perKmRate:      Joi.number().min(0),
  pickupTime:     Joi.date().iso(),
  notes:          Joi.string().max(500).allow(''),
});

module.exports = { createTaskSchema };