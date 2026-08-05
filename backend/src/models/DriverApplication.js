// src/models/DriverApplication.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Public applications submitted via the "Become a Driver" page.
// An admin reviews and approves/rejects each one; only an approved
// application yields a registrationToken, which is the only way to
// reach the register form (see authController.register).
const DriverApplication = sequelize.define('DriverApplication', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  applicantType:   { type: DataTypes.ENUM('driver_with_vehicle', 'driver_no_vehicle', 'partner'), allowNull: false },

  firstName:       { type: DataTypes.STRING, allowNull: false },
  lastName:        { type: DataTypes.STRING, allowNull: false },
  email:           { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  phone:           { type: DataTypes.STRING, allowNull: false },
  idNumber:        { type: DataTypes.STRING },
  city:            { type: DataTypes.STRING },

  // What kind of work they're interested in — subset of task categories.
  serviceInterest: { type: DataTypes.JSON, defaultValue: [] },

  // Only relevant for driver_with_vehicle / partner.
  vehicleType:     { type: DataTypes.STRING },
  vehicleReg:      { type: DataTypes.STRING },
  fleetSize:       { type: DataTypes.INTEGER },

  notes:           { type: DataTypes.TEXT },

  // Uploaded documents — stored under /uploads, same convention as Driver docs.
  idDocUrl:        { type: DataTypes.STRING },
  licenceDocUrl:   { type: DataTypes.STRING },
  discDocUrl:      { type: DataTypes.STRING },
  photoUrl:        { type: DataTypes.STRING },

  status:          { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  rejectionReason: { type: DataTypes.STRING },
  reviewedBy:      { type: DataTypes.UUID, allowNull: true, references: { model: 'Users', key: 'id' } },
  reviewedAt:      { type: DataTypes.DATE },

  // Issued only on approval. The Register page requires this token, and
  // registering consumes it by setting userId — a token can only ever be
  // used once, which is what actually enforces "approved applicants only".
  registrationToken:        { type: DataTypes.STRING, unique: true },
  registrationTokenExpires: { type: DataTypes.DATE },

  // Set once the applicant completes registration — prevents token reuse
  // and links the application back to the resulting account.
  userId:          { type: DataTypes.UUID, allowNull: true, unique: true, references: { model: 'Users', key: 'id' } },
}, {
  indexes: [{ fields: ['email'] }, { fields: ['status'] }, { fields: ['registrationToken'] }],
});

module.exports = DriverApplication;
