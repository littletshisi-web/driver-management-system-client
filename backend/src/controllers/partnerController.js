// src/controllers/partnerController.js
const Partner = require('../models/Partner');
const Driver  = require('../models/Driver');

// Maps frontend form fields to Partner model fields
const mapFormToModel = (body) => ({
  name:           body.name,
  contactName:    body.contactName,
  contactEmail:   body.email        ?? body.contactEmail,
  contactPhone:   body.phone        ?? body.contactPhone,
  commissionRate: body.commissionPct ?? body.commissionRate,
  status:         body.status       ?? 'active',
  type:           body.type         ?? 'general',
  zones:          body.zones        ?? [],
});

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
    const partner = await Partner.create(mapFormToModel(req.body));
    res.status(201).json({ success: true, data: partner });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const partner = await Partner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    await partner.update(mapFormToModel(req.body));
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

const getPartnerDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.findAll({
      where: { partnerId: req.params.id },
      attributes: ['id', 'firstName', 'lastName', 'phone', 'zone', 'status', 'rating', 'totalTrips'],
    });
    res.json({ success: true, data: drivers });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const [total, active] = await Promise.all([
      Partner.count(),
      Partner.count({ where: { status: 'active' } }),
    ]);
    res.json({ success: true, data: { total, active } });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, getPartnerDrivers, getStats };