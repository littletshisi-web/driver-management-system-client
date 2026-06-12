// src/controllers/areaController.js
const Area = require('../models/Area');

const getAll = async (req, res, next) => {
  try {
    const areas = await Area.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
    res.json({ success: true, data: areas });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const area = await Area.create(req.body);
    res.status(201).json({ success: true, data: area });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
    await area.update(req.body);
    res.json({ success: true, data: area });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
    await area.update({ isActive: false });
    res.json({ success: true, message: 'Area removed' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
