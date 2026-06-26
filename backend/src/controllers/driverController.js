// src/controllers/driverController.js
const { Op } = require('sequelize');
const Driver  = require('../models/Driver');
const Partner = require('../models/Partner');

const getAll = async (req, res, next) => {
  try {
    const { status, zone, partnerId, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)    where.status    = status;
    if (zone)      where.zone      = zone;
    if (partnerId) where.partnerId = partnerId;
    if (search) {
      const searchPattern = `%${search}%`;
      where[Op.or] = [
        { firstName: { [Op.like]: searchPattern } },
        { lastName:  { [Op.like]: searchPattern } },
        { phone:     { [Op.like]: searchPattern } },
      ];
    }
    const { rows, count } = await Driver.findAndCountAll({
      where,
      include: [{ model: Partner, attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, total: count, page: parseInt(page), data: rows });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [{ model: Partner, attributes: ['id', 'name', 'type'] }],
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    await driver.update(req.body);
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    await driver.update({ status: 'inactive' });
    res.json({ success: true, message: 'Driver deactivated' });
  } catch (err) { next(err); }
};

const uploadDoc = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const { field } = req.params;
    await driver.update({ [field]: req.file.filename });
    res.json({ success: true, message: 'Document uploaded', filename: req.file.filename });
  } catch (err) { next(err); }
};

const suspend = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    await driver.update({ status: 'inactive' });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const assignPartner = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const { partnerId } = req.body;
    await driver.update({ partnerId });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const removePartner = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    await driver.update({ partnerId: null });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

// GET /api/drivers/stats
// Returns total driver count and active driver count for the dashboard.
const getStats = async (req, res, next) => {
  try {
    const [total, active] = await Promise.all([
      Driver.count(),
      Driver.count({ where: { status: 'active' } }),
    ]);
    res.json({ success: true, data: { total, active } });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, uploadDoc, suspend, assignPartner, removePartner, getStats };