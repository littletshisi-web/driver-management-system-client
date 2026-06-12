// src/controllers/reportController.js
const reportService = require('../services/reportService');

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

module.exports = { generate, getAll };
