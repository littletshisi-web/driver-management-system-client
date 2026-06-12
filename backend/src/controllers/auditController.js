// src/controllers/auditController.js
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, action, userId } = req.query;
    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, total: count, page: parseInt(page), data: rows });
  } catch (err) { next(err); }
};

module.exports = { getAll };
