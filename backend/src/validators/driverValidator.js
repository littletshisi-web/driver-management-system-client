// src/validators/driverValidator.js
const Joi = require('joi');

const createDriverSchema = Joi.object({
  firstName:   Joi.string().required(),
  lastName:    Joi.string().required(),
  phone:       Joi.string().required(),
  email:       Joi.string().email(),
  idNumber:    Joi.string(),
  dateOfBirth: Joi.date().iso(),
  zone:        Joi.string(),
  partnerId:   Joi.string().uuid(),
  licenceNumber: Joi.string(),
  vehicleReg:    Joi.string(),
  shiftStart:  Joi.string().pattern(/^\d{2}:\d{2}$/),
  shiftEnd:    Joi.string().pattern(/^\d{2}:\d{2}$/),
  status:      Joi.string().valid('active', 'inactive', 'on-leave', 'suspended'),
});

const updateDriverSchema = createDriverSchema.fork(
  ['firstName', 'lastName', 'phone'], (f) => f.optional()
);

module.exports = { createDriverSchema, updateDriverSchema };