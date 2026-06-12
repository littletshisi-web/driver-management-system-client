// Area.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Area = sequelize.define('Area', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING, allowNull: false, unique: true },
  city:     { type: DataTypes.STRING },
  province: { type: DataTypes.STRING },
  lat:      { type: DataTypes.FLOAT },
  lng:      { type: DataTypes.FLOAT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Area;
