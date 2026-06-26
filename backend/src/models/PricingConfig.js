// src/models/PricingConfig.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Stores the entire pricing configuration as a single JSON row.
// We use a singleton pattern — there will only ever be one row (id = 1).
const PricingConfig = sequelize.define('PricingConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
  },
  baseFees: {
    type: DataTypes.JSON,
    defaultValue: {
      parcel_delivery: 85,
      vehicle_towing: 650,
      furniture_moving: 400,
    },
  },
  ratesPerKm: {
    type: DataTypes.JSON,
    defaultValue: {
      parcel_delivery: 4.5,
      vehicle_towing: 18,
      furniture_moving: 10,
    },
  },
  categoryModifiers: {
    type: DataTypes.JSON,
    defaultValue: {
      parcel_delivery: 1.0,
      vehicle_towing: 1.8,
      furniture_moving: 1.5,
    },
  },
  defaultCommissionPct:    { type: DataTypes.FLOAT, defaultValue: 12 },
  premiumCommissionPct:    { type: DataTypes.FLOAT, defaultValue: 8  },
  newPartnerCommissionPct: { type: DataTypes.FLOAT, defaultValue: 15 },
}, {
  tableName: 'PricingConfig',
});

module.exports = PricingConfig;