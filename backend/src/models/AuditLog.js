const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:     { type: DataTypes.UUID },
  action:     { type: DataTypes.STRING, allowNull: false },
  entity:     { type: DataTypes.STRING },
  entityId:   { type: DataTypes.UUID },
  changes:    { type: DataTypes.JSON, defaultValue: {} },
  ipAddress:  { type: DataTypes.STRING },
  userAgent:  { type: DataTypes.STRING },
}, { updatedAt: false });

module.exports = AuditLog;
