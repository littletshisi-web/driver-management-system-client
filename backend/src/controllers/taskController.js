// src/controllers/taskController.js
const Task    = require('../models/Task');
const Driver  = require('../models/Driver');
const Partner = require('../models/Partner');
const Area    = require('../models/Area');
const Earnings = require('../models/Earnings');
const generateTaskCode  = require('../utils/generateTaskCode');
const calculateDistance = require('../utils/calculateDistance');
const pricingService    = require('../services/pricingService');
const earningsService   = require('../services/earningsService');
const {
  sendTaskAssignedEmail,
  sendTaskCompletedEmail,
} = require('../services/emailService');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let { driverId, partnerId } = req.query;

    // Drivers can only ever see their own tasks — enforced server-side,
    // never trust a driverId passed in the query string for this role.
    if (req.user.role === 'driver') {
      const own = await Driver.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
      driverId = own?.id ?? '__none__';
    }
    // Partners can only ever see their own drivers' tasks — same pattern.
    if (req.user.role === 'partner') {
      const own = await Partner.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
      partnerId = own?.id ?? '__none__';
    }

    const where = {};
    if (status)    where.status    = status;
    if (driverId)  where.driverId  = driverId;
    if (partnerId) where.partnerId = partnerId;
    const { rows, count } = await Task.findAndCountAll({
      where,
      include: [
        { model: Driver,  attributes: ['id', 'firstName', 'lastName', 'zone'] },
        { model: Partner, attributes: ['id', 'name'] },
        { model: Area,    attributes: ['id', 'name', 'region'] },
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
        { model: Area,    attributes: ['id', 'name', 'region'] },
      ],
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // Partners can only create tasks under their own company, and only for
    // their own drivers — enforced server-side, never trust the client body.
    if (req.user.role === 'partner') {
      const own = await Partner.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
      body.partnerId = own?.id ?? null;
      if (body.driverId) {
        const ownDriver = await Driver.findOne({ where: { id: body.driverId, partnerId: body.partnerId } });
        if (!ownDriver) return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const { pickupLat, pickupLng, dropoffLat, dropoffLng, baseFare, perKmRate } = body;
    let distanceKm = body.distanceKm;
    if (!distanceKm && pickupLat && dropoffLat)
      distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const totalFare = pricingService.calculate(baseFare || 35, perKmRate || 12, distanceKm || 0);

    // A task created with a driver already assigned should land in the
    // "assigned" column, not sit invisibly in the default "pending" status
    // (the Task Board has no "pending" column). Only fall back to the
    // model's default ('pending') when no driver is set at creation time.
    const status = body.status || (body.driverId ? 'assigned' : undefined);

    const task = await Task.create({
      ...body,
      ...(status ? { status } : {}),
      taskCode: generateTaskCode(),
      distanceKm,
      totalFare,
    });

    // Send assignment email if driver is set at creation time
    if (task.driverId) {
      try {
        const driver = await Driver.findByPk(task.driverId);
        if (driver?.email) {
          await sendTaskAssignedEmail(
            driver.email,
            `${driver.firstName} ${driver.lastName}`.trim(),
            task
          );
        }
      } catch (emailErr) {
        console.error('Task assigned email failed:', emailErr.message);
      }
    }

    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Driver,  attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Partner, attributes: ['id', 'name', 'contactEmail'] },
      ],
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Drivers can only progress a task actually assigned to them; partners
    // only for tasks belonging to their own drivers. Never trust the role
    // alone — verify ownership against the authenticated user's own record.
    if (req.user.role === 'driver') {
      const own = await Driver.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
      if (!own || task.driverId !== own.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    if (req.user.role === 'partner') {
      const own = await Partner.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
      if (!own || task.partnerId !== own.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const updates = { status };
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
      await earningsService.recordEarning(task);
      await Driver.increment('totalTrips', { where: { id: task.driverId } });

      // Notify partner that task is complete
      try {
        if (task.Partner?.contactEmail) {
          const driverName = task.Driver
            ? `${task.Driver.firstName} ${task.Driver.lastName}`.trim()
            : 'Unknown Driver';
          await sendTaskCompletedEmail(
            task.Partner.contactEmail,
            task.Partner.name,
            task,
            driverName
          );
        }
      } catch (emailErr) {
        console.error('Task completed email failed:', emailErr.message);
      }
    }

    await task.update(updates);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.update({ driverId, status: 'assigned' });

    // Notify driver of assignment
    try {
      const driver = await Driver.findByPk(driverId);
      if (driver?.email) {
        await sendTaskAssignedEmail(
          driver.email,
          `${driver.firstName} ${driver.lastName}`.trim(),
          task
        );
      }
    } catch (emailErr) {
      console.error('Task assigned email failed:', emailErr.message);
    }

    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// GET /api/tasks/stats
const getStats = async (req, res, next) => {
  try {
    let { partnerId } = req.query;
    if (req.user.role === 'partner') {
      const own = await Partner.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
      partnerId = own?.id ?? '__none__';
    }
    const base = partnerId ? { partnerId } : {};
    const [total, active, pending] = await Promise.all([
      Task.count({ where: base }),
      Task.count({ where: { ...base, status: { [Op.in]: ['assigned', 'in-transit'] } } }),
      Task.count({ where: { ...base, status: 'pending' } }),
    ]);
    res.json({ success: true, data: { total, active, pending } });
  } catch (err) { next(err); }
};

// GET /api/tasks/stats-by-category
const getStatsByCategory = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({ attributes: ['category'] });

    const counts = {};
    tasks.forEach((t) => {
      const cat = t.category || 'unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = tasks.length;

    const CATEGORY_LABELS = {
      parcel_delivery:  'Parcel Delivery',
      vehicle_towing:   'Vehicle Towing',
      furniture_moving: 'Furniture Moving',
    };

    const CATEGORY_COLOURS = {
      parcel_delivery:  '#1e3a5f',
      vehicle_towing:   '#4a2080',
      furniture_moving: '#0d5c5c',
    };

    const data = Object.entries(counts).map(([key, count]) => ({
      label:  CATEGORY_LABELS[key] ?? key,
      value:  total > 0 ? Math.round((count / total) * 100) : 0,
      count,
      colour: CATEGORY_COLOURS[key] ?? '#555',
    }));

    res.json({ success: true, data, total });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, updateStatus, assignDriver, getStats, getStatsByCategory };