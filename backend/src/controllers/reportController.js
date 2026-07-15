// src/controllers/reportController.js
const reportService = require('../services/reportService');
const Earnings = require('../models/Earnings');
const Driver = require('../models/Driver');
const Partner = require('../models/Partner');
const Task = require('../models/Task');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

// Resolves the Driver record linked to the logged-in user (if any).
const getOwnDriverId = async (userId) => {
  const driver = await Driver.findOne({ where: { userId } });
  return driver ? driver.id : null;
};

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
    const { from, to } = req.query;
    const where = {};

    if (req.user.role === 'driver') {
      const ownDriverId = await getOwnDriverId(req.user.id);
      where.driverId = ownDriverId || '00000000-0000-0000-0000-000000000000';
    } else if (req.query.driverId) {
      where.driverId = req.query.driverId;
    }

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
    const { from, to, partnerId } = req.query;
    const where = {};

    if (req.user.role === 'driver') {
      const ownDriverId = await getOwnDriverId(req.user.id);
      where.driverId = ownDriverId || '00000000-0000-0000-0000-000000000000';
    } else if (req.query.driverId) {
      where.driverId = req.query.driverId;
    }

    if (partnerId) where.partnerId = partnerId;
    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };

    const tasks = await Task.findAll({
      where,
      include: [{ model: Driver, attributes: ['id', 'firstName', 'lastName'] }],
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

// ─── PDF generation helper ────────────────────────────────────────────────────
const buildPDF = (headers, rows, title) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primary = '#1e3a5f';
    const pageW   = doc.page.width - 80; // usable width

    // ── Header band ──
    doc.rect(0, 0, doc.page.width, 70).fill(primary);
    doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
       .text('DMS — Driver Management System', 40, 18);
    doc.fontSize(10).font('Helvetica')
       .text(title, 40, 42);
    doc.fillColor('#ccddee').fontSize(8)
       .text(`Generated: ${new Date().toLocaleString('en-ZA')}`, 40, 56);

    // ── Table ──
    const colW   = Math.floor(pageW / headers.length);
    const rowH   = 22;
    let   y      = 90;

    // Header row
    doc.rect(40, y, pageW, rowH).fill('#e8eef5');
    doc.fillColor(primary).fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(String(h), 44 + i * colW, y + 6, { width: colW - 4, lineBreak: false });
    });
    y += rowH;

    // Data rows
    doc.font('Helvetica').fontSize(8);
    rows.forEach((row, ri) => {
      if (y > doc.page.height - 60) { doc.addPage(); y = 40; }
      if (ri % 2 === 0) doc.rect(40, y, pageW, rowH).fill('#f7f9fb');
      doc.fillColor('#222');
      row.forEach((cell, i) => {
        const val = cell == null ? '—' : String(cell);
        doc.text(val, 44 + i * colW, y + 6, { width: colW - 4, lineBreak: false });
      });
      y += rowH;
    });

    // ── Footer ──
    doc.fillColor('#888').fontSize(7)
       .text('FleetHQ · Confidential', 40, doc.page.height - 30, { align: 'center', width: pageW });

    doc.end();
  });
};

const exportReport = async (req, res, next) => {
  try {
    const { type = 'csv', from, to, reportType = 'tasks' } = req.query;
    const where = {};

    if (req.user.role === 'driver') {
      const ownDriverId = await getOwnDriverId(req.user.id);
      where.driverId = ownDriverId || '00000000-0000-0000-0000-000000000000';
    } else if (req.query.driverId) {
      where.driverId = req.query.driverId;
    }

    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };

    let rows = [];
    let headers = [];
    let title = '';

    if (reportType === 'earnings') {
      const earnings = await Earnings.findAll({
        where,
        include: [{ model: Driver, attributes: ['firstName', 'lastName'] }],
      });
      title   = 'Earnings Report';
      headers = ['Driver', 'Amount (R)', 'Commission (R)', 'Net (R)', 'Status', 'Date'];
      rows    = earnings.map(e => [
        `${e.Driver?.firstName || ''} ${e.Driver?.lastName || ''}`.trim(),
        (e.amount || 0).toFixed(2),
        (e.commission || 0).toFixed(2),
        (e.netAmount || 0).toFixed(2),
        e.status,
        new Date(e.createdAt).toLocaleDateString('en-ZA'),
      ]);
    } else {
      const tasks = await Task.findAll({
        where,
        include: [{ model: Driver, attributes: ['firstName', 'lastName'] }],
      });
      title   = 'Task Report';
      headers = ['Task Code', 'Driver', 'Status', 'Pickup', 'Dropoff', 'Fare (R)', 'Date'];
      rows    = tasks.map(t => [
        t.taskCode,
        `${t.Driver?.firstName || ''} ${t.Driver?.lastName || ''}`.trim(),
        t.status,
        t.pickupAddress,
        t.dropoffAddress,
        (t.totalFare || 0).toFixed(2),
        new Date(t.createdAt).toLocaleDateString('en-ZA'),
      ]);
    }

    if (type === 'pdf') {
      const pdfBuffer = await buildPDF(headers, rows, title);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="dms-${reportType}-${Date.now()}.pdf"`);
      return res.send(pdfBuffer);
    }

    // CSV
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csvContent = [
      headers.map(escape).join(','),
      ...rows.map(r => r.map(escape).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dms-${reportType}-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) { next(err); }
};

const getRevenueSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const from = req.query.from ? new Date(req.query.from) : defaultFrom;
    const to   = req.query.to   ? new Date(req.query.to)   : defaultTo;

    const where = { createdAt: { [Op.between]: [from, to] } };

    // Partner-scoped view: only earnings for drivers assigned to this partner.
    // A partner can never see another partner's numbers, regardless of query params.
    let partnerId = req.query.partnerId;
    if (req.user.role === 'partner') {
      const own = await Partner.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
      partnerId = own?.id ?? '__none__';
    }
    if (partnerId) {
      const drivers = await Driver.findAll({ where: { partnerId }, attributes: ['id'] });
      where.driverId = { [Op.in]: drivers.map((d) => d.id) };
    }

    const earnings = await Earnings.findAll({
      where,
      attributes: ['amount', 'netAmount'],
    });

    const totals = earnings.reduce((acc, e) => ({
      gross: acc.gross + (e.amount || 0),
      net:   acc.net   + (e.netAmount || 0),
    }), { gross: 0, net: 0 });

    res.json({ success: true, data: { ...totals, from, to } });
  } catch (err) { next(err); }
};

const getTasksByDay = async (req, res, next) => {
  try {
    const days = parseInt(req.query.last) || 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const count = await Task.count({
        where: {
          status: 'delivered',
          deliveredAt: { [Op.between]: [date, end] },
        },
      });

      result.push({
        label: date.toLocaleDateString('en-ZA', { weekday: 'short' }),
        value: count,
        date:  date.toISOString().split('T')[0],
      });
    }
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = {
  generate,
  getAll,
  getEarnings,
  getTaskReport,
  exportReport,
  getRevenueSummary,
  getTasksByDay,
};