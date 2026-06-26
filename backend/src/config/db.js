const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const dialect = process.env.DB_DIALECT || 'sqlite';

const baseOptions = {
  dialect,
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
    evict: 10000,
  },
};

if (dialect === 'sqlite') {
  baseOptions.storage = process.env.DB_STORAGE || './database.sqlite';
} else {
  baseOptions.host = process.env.DB_HOST;
  baseOptions.port = process.env.DB_PORT || 3306;

  baseOptions.dialectOptions = {
    connectTimeout: 60000,
  };

  if (process.env.DB_SSL === 'true') {
    baseOptions.dialectOptions.ssl = {
      require: true,
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    };
  }
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, baseOptions)
  : new Sequelize(
      dialect === 'sqlite' ? undefined : process.env.DB_NAME,
      dialect === 'sqlite' ? undefined : process.env.DB_USER,
      dialect === 'sqlite' ? undefined : process.env.DB_PASSWORD,
      baseOptions,
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connected successfully');
    // Use sync() without alter:true to avoid duplicate index buildup on every restart.
    // alter:true re-applies unique constraints each time, causing email_2, email_3, etc.
    // Use { force: true } only once manually if you need to reset the schema.
    await sequelize.sync();
    logger.info('Database synced');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };