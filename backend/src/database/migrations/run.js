// src/database/migrations/run.js
require('dotenv').config();
const { connectDB, sequelize } = require('../../config/db');

// Import all models so Sequelize registers them before sync
require('../../models/User');
require('../../models/Partner');
require('../../models/Driver');
require('../../models/Task');
require('../../models/Earnings');
require('../../models/Report');
require('../../models/Area');
require('../../models/AuditLog');

// Set up associations
const Driver  = require('../../models/Driver');
const Partner = require('../../models/Partner');
const Task    = require('../../models/Task');
const Earnings = require('../../models/Earnings');

Partner.hasMany(Driver,   { foreignKey: 'partnerId' });
Driver.belongsTo(Partner, { foreignKey: 'partnerId' });

Partner.hasMany(Task,     { foreignKey: 'partnerId' });
Task.belongsTo(Partner,   { foreignKey: 'partnerId' });

Driver.hasMany(Task,      { foreignKey: 'driverId' });
Task.belongsTo(Driver,    { foreignKey: 'driverId' });

Driver.hasMany(Earnings,  { foreignKey: 'driverId' });
Earnings.belongsTo(Driver,{ foreignKey: 'driverId' });

Task.hasOne(Earnings,     { foreignKey: 'taskId' });
Earnings.belongsTo(Task,  { foreignKey: 'taskId' });

const migrate = async () => {
  await connectDB();
  await sequelize.sync({ force: false, alter: true });
  console.log('✅ Migrations complete');
  await sequelize.close();
};

migrate().catch((err) => { console.error(err); process.exit(1); });
