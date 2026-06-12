// src/controllers/reportController.js
const reportService = require('../services/reportService');
const Earnings = require('../models/Earnings');
const Driver = require('../models/Driver');
const Task = require('../models/Task');
const { Op } = require('sequelize');

const generate = async (req, res, next) => {
  try {
    const { type, from, to, driverIds, format = 'csv' } = req.body;
    const report = await reportService.generate({ type, from, to, driverIds, format, userId: req.user.id });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const Report = require('../models/Report');
    const reports = await Report.findAll({ where: { generatedBy: req.user.id }, order: [['createdAt', 'DESC']], limit: 50 });
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
};

const getEarnings = async (req, res, next) => {
  try {
    const { from, to, driverId, partnerId } = req.query;
    const where = {};
    if (driverId) where.driverId = driverId;
    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };

    const earnings = await Earnings.findAll({
      where,
      include: [{ model: Driver, attributes: ['id', 'firstName', 'lastName', 'zone'] }],
      order: [['createdAt', 'DESC']],
    });

    const totals = earnings.reduce((acc, e) => ({
      gross: acc.gross + (e.amount || 0),
      net: acc.net + (e.netAmount || 0),
    }), { gross: 0, net: 0 });

    res.json({ success: true, data: earnings, totals });
  } catch (err) { next(err); }
};

const getTaskReport = async (req, res, next) => {
  try {
    const { from, to, partnerId, driverId } = req.query;
    const where = {};
    if (partnerId) where.partnerId = partnerId;
    if (driverId) where.driverId = driverId;
    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Driver, attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const summary = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'delivered').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      inProgress: tasks.filter(t => t.status === 'assigned' || t.status === 'in-transit').length,
    };

    res.json({ success: true, data: tasks, summary });
  } catch (err) { next(err); }
};

const exportReport = async (req, res, next) => {
  try {
    const { type = 'csv', from, to, reportType = 'tasks' } = req.query;
    // Generate CSV from task/earnings data
    const where = {};
    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };

    let rows = [];
    let headers = [];

    if (reportType === 'earnings') {
      const earnings = await Earnings.findAll({
        where,
        include: [{ model: Driver, attributes: ['firstName', 'lastName'] }],
      });
      headers = ['Driver', 'Amount', 'Commission', 'Net', 'Status', 'Date'];
      rows = earnings.map(e => [
        `${e.Driver?.firstName || ''} ${e.Driver?.lastName || ''}`,
        e.amount, e.commission, e.netAmount, e.status, e.createdAt,
      ]);
    } else {
      const tasks = await Task.findAll({
        where,
        include: [{ model: Driver, attributes: ['firstName', 'lastName'] }],
      });
      headers = ['Task Code', 'Driver', 'Status', 'Pickup', 'Dropoff', 'Total Fare', 'Date'];
      rows = tasks.map(t => [
        t.taskCode,
        `${t.Driver?.firstName || ''} ${t.Driver?.lastName || ''}`,
        t.status, t.pickupAddress, t.dropoffAddress, t.totalFare, t.createdAt,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    if (type === 'pdf') {
      // Simple text-based "PDF" for now — real PDF generation would use a library
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.pdf"`);
      res.send(Buffer.from(csvContent)); // placeholder
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.csv"`);
      res.send(csvContent);
    }
  } catch (err) { next(err); }
};

module.exports = { generate, getAll, getEarnings, getTaskReport, exportReport };
