// src/services/taskAssignmentService.js
const Driver = require('../models/Driver');
const { findBestDriver } = require('../utils/areaMatcher');

const autoAssign = async (task) => {
  const drivers = await Driver.findAll({ where: { status: 'active' } });
  const best = findBestDriver(drivers.map(d => ({ ...d.toJSON(), zone: d.zone })), task.pickupAddress);
  if (best) {
    await task.update({ driverId: best.id, status: 'assigned' });
    return best;
  }
  return null;
};

module.exports = { autoAssign };
