// src/validators/pricingValidator.js
const Joi = require('joi');

const pricingSchema = Joi.object({
  baseFare:   Joi.number().min(0).required(),
  perKmRate:  Joi.number().min(0).required(),
  partnerId:  Joi.string().uuid(),
  zone:       Joi.string(),
});

module.exports = { pricingSchema };
