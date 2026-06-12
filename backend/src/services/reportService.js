// src/services/reportService.js
const { Op } = require('sequelize');
const Driver   = require('../models/Driver');
const Earnings = require('../models/Earnings');
const Report   = require('../models/Report');
const { formatZAR } = require('../utils/currencyFormatter');
const path = require('path');
const fs   = require('fs');

const generate = async ({ type, from, to, driverIds, format, userId }) => {
  const report = await Report.create({ type, generatedBy: userId, filters: { from, to, driverIds }, status: 'pending' });

  try {
    let data = [];
    if (type === 'payments') {
      const where = { status: 'pending' };
      if (driverIds?.length) where.driverId = { [Op.in]: driverIds };
      if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
      const earnings = await Earnings.findAll({ where, include: [{ model: Driver, attributes: ['firstName', 'lastName', 'zone'] }] });
      data = earnings.map(e => ({
        driver: `${e.Driver?.firstName} ${e.Driver?.lastName}`,
        zone:   e.Driver?.zone,
        amount: formatZAR(e.amount),
        commission: formatZAR(e.commission),
        net:    formatZAR(e.netAmount),
        status: e.status,
      }));
    }

    // Write CSV
    const uploadsDir = process.env.UPLOAD_PATH || './uploads';
    const filename   = `report-${report.id}.csv`;
    const filepath   = path.join(uploadsDir, filename);
    const header     = data.length ? Object.keys(data[0]).join(',') : '';
    const rows       = data.map(r => Object.values(r).join(','));
    fs.writeFileSync(filepath, [header, ...rows].join('\n'));

    await report.update({ status: 'ready', fileUrl: `/uploads/${filename}` });
    return report.reload();
  } catch (err) {
    await report.update({ status: 'failed' });
    throw err;
  }
};

module.exports = { generate };
