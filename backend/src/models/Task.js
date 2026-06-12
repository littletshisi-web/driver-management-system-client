const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  taskCode:       { type: DataTypes.STRING, unique: true },
  type:           { type: DataTypes.ENUM('food', 'parcels', 'grocery', 'other'), defaultValue: 'food' },
  driverId:       { type: DataTypes.UUID, references: { model: 'Drivers', key: 'id' } },
  partnerId:      { type: DataTypes.UUID, references: { model: 'Partners', key: 'id' } },
  pickupAddress:  { type: DataTypes.STRING, allowNull: false },
  pickupLat:      { type: DataTypes.FLOAT },
  pickupLng:      { type: DataTypes.FLOAT },
  dropoffAddress: { type: DataTypes.STRING, allowNull: false },
  dropoffLat:     { type: DataTypes.FLOAT },
  dropoffLng:     { type: DataTypes.FLOAT },
  distanceKm:     { type: DataTypes.FLOAT },
  baseFare:       { type: DataTypes.FLOAT, defaultValue: 35 },
  perKmRate:      { type: DataTypes.FLOAT, defaultValue: 12 },
  totalFare:      { type: DataTypes.FLOAT },
  status:         { type: DataTypes.ENUM('pending', 'assigned', 'in-transit', 'delivered', 'cancelled'), defaultValue: 'pending' },
  pickupTime:     { type: DataTypes.DATE },
  deliveredAt:    { type: DataTypes.DATE },
  notes:          { type: DataTypes.TEXT },
}, {
  indexes: [{ fields: ['driverId'] }, { fields: ['partnerId'] }, { fields: ['status'] }, { fields: ['taskCode'] }],
});

module.exports = Task;
