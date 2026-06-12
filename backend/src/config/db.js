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
  },
};

if (dialect === 'sqlite') {
  baseOptions.storage = process.env.DB_STORAGE || './database.sqlite';
  baseOptions.logging = (msg) => logger.debug(msg);
} else {
  baseOptions.host = process.env.DB_HOST;
  baseOptions.port = process.env.DB_PORT || 3306;
  if (process.env.DB_SSL === 'true') {
    baseOptions.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
    };
  }
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, baseOptions)
  : dialect === 'sqlite'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: baseOptions.storage,
        logging: baseOptions.logging,
      })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        baseOptions,
      );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connected successfully');
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
