require('dotenv').config();
const app = require('./config/server');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`FleetHQ server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();
