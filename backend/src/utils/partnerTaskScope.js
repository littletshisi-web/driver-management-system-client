// src/utils/partnerTaskScope.js
const { Op } = require('sequelize');
const Driver = require('../models/Driver');

// Returns a Sequelize where-fragment matching any task that belongs to the
// given partner — either explicitly tagged with their partnerId, or
// assigned to one of their own drivers.
//
// Why both: a task's own partnerId column only gets set when the partner
// creates the task themselves (see taskController.create). A task admin
// creates and assigns to one of that partner's drivers never gets
// partnerId set, so relying on that column alone silently hides every
// admin-created task from the partner who actually owns the driver —
// across the task list, the task board charts, dashboard stats, and task
// reports. This fragment covers both cases everywhere a partner-scoped
// task query is built.
async function buildPartnerTaskScope(partnerId) {
  const ownDrivers = await Driver.findAll({ where: { partnerId }, attributes: ['id'] });
  const ownDriverIds = ownDrivers.map((d) => d.id);
  return {
    [Op.or]: [
      { partnerId },
      ...(ownDriverIds.length ? [{ driverId: { [Op.in]: ownDriverIds } }] : []),
    ],
  };
}

module.exports = { buildPartnerTaskScope };
