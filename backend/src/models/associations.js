/**
 * Model Associations
 * Set up all Sequelize associations here.
 * Import this file once in config/server.js to ensure all relationships are available at runtime.
 */

const Partner = require('./Partner');
const Driver = require('./Driver');
const Task = require('./Task');
const Earnings = require('./Earnings');
const Report = require('./Report');
const Area = require('./Area');
const AuditLog = require('./AuditLog');
const User = require('./User');
const PricingConfig = require('./PricingConfig');
const DriverApplication = require('./DriverApplication');
// No associations needed — it's a standalone singleton table

// Partner ↔ Driver
Partner.hasMany(Driver, { foreignKey: 'partnerId' });
Driver.belongsTo(Partner, { foreignKey: 'partnerId' });

// Partner ↔ Task
Partner.hasMany(Task, { foreignKey: 'partnerId' });
Task.belongsTo(Partner, { foreignKey: 'partnerId' });

// Driver ↔ Task
Driver.hasMany(Task, { foreignKey: 'driverId' });
Task.belongsTo(Driver, { foreignKey: 'driverId' });

// Area ↔ Task
Area.hasMany(Task, { foreignKey: 'areaId' });
Task.belongsTo(Area, { foreignKey: 'areaId' });

// Driver ↔ Earnings
Driver.hasMany(Earnings, { foreignKey: 'driverId' });
Earnings.belongsTo(Driver, { foreignKey: 'driverId' });

// Task ↔ Earnings
Task.hasOne(Earnings, { foreignKey: 'taskId' });
Earnings.belongsTo(Task, { foreignKey: 'taskId' });

// User ↔ Driver  ✅ NEW — links the auth/login User to their operational Driver record
User.hasOne(Driver, { foreignKey: 'userId' });
Driver.belongsTo(User, { foreignKey: 'userId' });

// User ↔ Partner — links the auth/login User to their operational Partner record
User.hasOne(Partner, { foreignKey: 'userId' });
Partner.belongsTo(User, { foreignKey: 'userId' });

// User → Reports (generatedBy)
User.hasMany(Report, { foreignKey: 'generatedBy' });
Report.belongsTo(User, { foreignKey: 'generatedBy' });

// User → AuditLog
User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// User → DriverApplication (admin who reviewed it)
User.hasMany(DriverApplication, { foreignKey: 'reviewedBy', as: 'reviewedApplications' });
DriverApplication.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// User ↔ DriverApplication (the account created once the applicant registers)
User.hasOne(DriverApplication, { foreignKey: 'userId' });
DriverApplication.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  Partner,
  Driver,
  Task,
  Earnings,
  Report,
  Area,
  AuditLog,
  User,
  DriverApplication,
};