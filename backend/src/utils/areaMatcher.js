// areaMatcher.js — match a driver's zone to a task's area
const areaMatcher = (driverZone, taskArea) => {
  if (!driverZone || !taskArea) return false;
  return driverZone.trim().toLowerCase() === taskArea.trim().toLowerCase();
};

const findBestDriver = (drivers, taskArea) =>
  drivers.find((d) => areaMatcher(d.zone, taskArea) && d.status === 'active') || null;

module.exports = { areaMatcher, findBestDriver };
