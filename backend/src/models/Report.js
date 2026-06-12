// Report.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type:       { type: DataTypes.ENUM('payments', 'trips', 'drivers', 'partners'), allowNull: false },
  generatedBy:{ type: DataTypes.UUID, references: { model: 'Users', key: 'id' } },
  filters:    { type: DataTypes.JSON, defaultValue: {} },
  fileUrl:    { type: DataTypes.STRING },
  status:     { type: DataTypes.ENUM('pending', 'ready', 'failed'), defaultValue: 'pending' },
});

module.exports = Report;
