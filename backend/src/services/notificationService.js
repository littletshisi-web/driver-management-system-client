// src/services/notificationService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error(`Email failed: ${err.message}`);
  }
};

const notifyDriverAdded = (driver) =>
  sendEmail({
    to: driver.email,
    subject: 'Welcome to FleetHQ',
    html: `<p>Hi ${driver.firstName}, your FleetHQ driver account is ready.</p>`,
  });

const notifyTripAssigned = (driver, task) =>
  sendEmail({
    to: driver.email,
    subject: `New trip assigned — ${task.taskCode}`,
    html: `<p>Hi ${driver.firstName}, you have a new delivery from ${task.pickupAddress} to ${task.dropoffAddress}.</p>`,
  });

module.exports = { sendEmail, notifyDriverAdded, notifyTripAssigned };
