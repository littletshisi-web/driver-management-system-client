require('dotenv').config();
const { sequelize } = require('../config/db');

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection successful');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message || error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

testConnection();
