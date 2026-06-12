// src/services/earningsService.js
const Earnings = require('../models/Earnings');
const Partner  = require('../models/Partner');

const recordEarning = async (task) => {
  const partner = task.partnerId ? await Partner.findByPk(task.partnerId) : null;
  const commissionRate = partner ? partner.commissionRate / 100 : 0;
  const commission = parseFloat((task.totalFare * commissionRate).toFixed(2));
  const netAmount  = parseFloat((task.totalFare - commission).toFixed(2));
  return Earnings.create({
    driverId: task.driverId,
    taskId:   task.id,
    amount:   task.totalFare,
    commission,
    netAmount,
    status: 'pending',
  });
};

const getDriverEarnings = async (driverId, from, to) => {
  const { Op, fn, col } = require('sequelize');
  const where = { driverId };
  if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
  return Earnings.findAll({ where });
};

module.exports = { recordEarning, getDriverEarnings };
