// src/validators/applicationValidator.js
const Joi = require('joi');

// Applied to req.body AFTER multer has parsed the multipart form, so text
// fields are available here — file fields live on req.files instead.
const createApplicationSchema = Joi.object({
  applicantType:   Joi.string().valid('driver_with_vehicle', 'driver_no_vehicle', 'partner').required(),
  firstName:       Joi.string().required(),
  lastName:        Joi.string().required(),
  email:           Joi.string().email().required(),
  phone:           Joi.string().required(),
  idNumber:        Joi.string().allow(''),
  city:            Joi.string().allow(''),
  vehicleType:     Joi.string().allow(''),
  vehicleReg:      Joi.string().allow(''),
  fleetSize:       Joi.string().allow(''), // multipart fields arrive as strings; coerced to number in the controller
  notes:           Joi.string().max(500).allow(''),
  // Sent as a JSON-encoded array string, e.g. '["parcel_delivery","vehicle_towing"]'
  serviceInterest: Joi.string().allow(''),
});

module.exports = { createApplicationSchema };
