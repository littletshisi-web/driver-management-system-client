const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  taskCode:       { type: DataTypes.STRING, unique: true },

  // category is the primary classification used throughout the app
  // (pricing, reports, donut chart). 'type' is kept for backward compatibility.
  category:       {
    type: DataTypes.ENUM('parcel_delivery', 'vehicle_towing', 'furniture_moving'),
    defaultValue: 'parcel_delivery',
    allowNull: false,
  },
  type:           { type: DataTypes.ENUM('food', 'parcels', 'grocery', 'other'), defaultValue: 'other' },

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
  status:         {
    type: DataTypes.ENUM('pending', 'assigned', 'in-transit', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  pickupTime:     { type: DataTypes.DATE },
  deliveredAt:    { type: DataTypes.DATE },
  notes:          { type: DataTypes.TEXT },
}, {
  indexes: [
    { fields: ['driverId'] },
    { fields: ['partnerId'] },
    { fields: ['status'] },
    { fields: ['taskCode'] },
    { fields: ['category'] },
  ],
});

module.exports = Task;