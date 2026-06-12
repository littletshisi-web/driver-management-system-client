// src/controllers/partnerController.js
const Partner = require('../models/Partner');
const Driver  = require('../models/Driver');

const getAll = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type)   where.type   = type;
    const partners = await Partner.findAll({ where, order: [['name', 'ASC']] });
    res.json({ success: true, data: partners });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const partner = await Partner.findByPk(req.params.id, {
      include: [{ model: Driver, attributes: ['id', 'firstName', 'lastName', 'status', 'zone'] }],
    });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    res.json({ success: true, data: partner });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json({ success: true, data: partner });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const partner = await Partner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    await partner.update(req.body);
    res.json({ success: true, data: partner });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const partner = await Partner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    await partner.update({ status: 'inactive' });
    res.json({ success: true, message: 'Partner deactivated' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
