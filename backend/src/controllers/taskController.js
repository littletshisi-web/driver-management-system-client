// src/controllers/taskController.js
const Task    = require('../models/Task');
const Driver  = require('../models/Driver');
const Partner = require('../models/Partner');
const Earnings = require('../models/Earnings');
const generateTaskCode  = require('../utils/generateTaskCode');
const calculateDistance = require('../utils/calculateDistance');
const pricingService    = require('../services/pricingService');
const earningsService   = require('../services/earningsService');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { status, driverId, partnerId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)    where.status    = status;
    if (driverId)  where.driverId  = driverId;
    if (partnerId) where.partnerId = partnerId;
    const { rows, count } = await Task.findAndCountAll({
      where,
      include: [
        { model: Driver,  attributes: ['id', 'firstName', 'lastName', 'zone'] },
        { model: Partner, attributes: ['id', 'name'] },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, total: count, page: parseInt(page), data: rows });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Driver,  attributes: ['id', 'firstName', 'lastName', 'phone', 'zone'] },
        { model: Partner, attributes: ['id', 'name', 'commissionRate'] },
      ],
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, baseFare, perKmRate } = req.body;
    let distanceKm = req.body.distanceKm;
    if (!distanceKm && pickupLat && dropoffLat)
      distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const totalFare = pricingService.calculate(baseFare || 35, perKmRate || 12, distanceKm || 0);
    const task = await Task.create({ ...req.body, taskCode: generateTaskCode(), distanceKm, totalFare });
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const updates = { status };
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
      await earningsService.recordEarning(task);
      await Driver.increment('totalTrips', { where: { id: task.driverId } });
    }
    await task.update(updates);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, updateStatus };
