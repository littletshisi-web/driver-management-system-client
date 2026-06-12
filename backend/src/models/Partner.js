// Partner.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Partner = sequelize.define('Partner', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:           { type: DataTypes.STRING, allowNull: false },
  tradingName:    { type: DataTypes.STRING },
  registrationNo: { type: DataTypes.STRING },
  vatNumber:      { type: DataTypes.STRING },
  type:           { type: DataTypes.ENUM('food', 'parcels', 'grocery', 'general'), defaultValue: 'general' },
  commissionRate: { type: DataTypes.FLOAT, defaultValue: 10 },
  paymentTerms:   { type: DataTypes.ENUM('weekly', 'bi-weekly', 'monthly', 'per-trip'), defaultValue: 'monthly' },
  zones:          { type: DataTypes.JSON, defaultValue: [] },
  contactName:    { type: DataTypes.STRING },
  contactPhone:   { type: DataTypes.STRING },
  contactEmail:   { type: DataTypes.STRING },
  status:         { type: DataTypes.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
});

module.exports = Partner;
