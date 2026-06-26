// src/controllers/auditController.js
const { Op } = require('sequelize');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// GET /api/audit
// Admin-only — lists audit log entries, most recent first, with optional filters.
// Query params: { userId?, action?, entity?, from?, to?, page?, limit? }
const getAll = async (req, res, next) => {
  try {
    const { userId, action, entity, from, to, page = 1, limit = 50 } = req.query;
    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ success: true, total: count, page: parseInt(page), data: rows });
  } catch (err) { next(err); }
};

// GET /api/audit/:id
// Admin-only — fetch a single audit log entry by id.
const getOne = async (req, res, next) => {
  try {
    const entry = await AuditLog.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
    });
    if (!entry) return res.status(404).json({ success: false, message: 'Audit log entry not found' });
    res.json({ success: true, data: entry });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne };