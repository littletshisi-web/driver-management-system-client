// src/models/Area.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Area = sequelize.define('Area', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:          { type: DataTypes.STRING, allowNull: false, unique: true },
  region:        { type: DataTypes.STRING },
  city:          { type: DataTypes.STRING },
  province:      { type: DataTypes.STRING },
  lat:           { type: DataTypes.FLOAT },
  lng:           { type: DataTypes.FLOAT },
  zoneType:      { type: DataTypes.ENUM('Standard', 'Extended', 'Remote'), defaultValue: 'Standard' },
  priceModifier: { type: DataTypes.FLOAT, defaultValue: 1.0 },
  driverCount:   { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Area;