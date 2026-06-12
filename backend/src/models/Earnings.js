// Earnings.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Earnings = sequelize.define('Earnings', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  driverId:     { type: DataTypes.UUID, allowNull: false, references: { model: 'Drivers', key: 'id' } },
  taskId:       { type: DataTypes.UUID, references: { model: 'Tasks', key: 'id' } },
  amount:       { type: DataTypes.FLOAT, allowNull: false },
  commission:   { type: DataTypes.FLOAT, defaultValue: 0 },
  netAmount:    { type: DataTypes.FLOAT },
  status:       { type: DataTypes.ENUM('pending', 'paid', 'cancelled'), defaultValue: 'pending' },
  paidAt:       { type: DataTypes.DATE },
  periodStart:  { type: DataTypes.DATEONLY },
  periodEnd:    { type: DataTypes.DATEONLY },
});

module.exports = Earnings;
