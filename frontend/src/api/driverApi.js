import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// GET /api/drivers
// Params: { search, status, page, limit, partnerId }
// Response: { data: Driver[], total: number, page: number, limit: number }
export const getDrivers = (params = {}) =>
  api.get(API.DRIVERS, { params });

// GET /api/drivers/:id
// Response: Driver object
export const getDriver = (id) =>
  api.get(API.DRIVER(id));

// POST /api/drivers
// Body: { name, phone, licenseNumber, vehicleType, vehicleReg, areaId, partnerId?, availabilityStatus }
// Response: { data: Driver }
export const createDriver = (data) =>
  api.post(API.DRIVERS, data);

// PUT /api/drivers/:id
// Body: Partial driver fields to update
// Response: { data: Driver }
export const updateDriver = (id, data) =>
  api.put(API.DRIVER(id), data);

// PATCH /api/drivers/:id/suspend
// Sets the driver's availabilityStatus to "inactive".
// Response: { data: Driver }
export const suspendDriver = (id) =>
  api.patch(API.DRIVER_SUSPEND(id));

// DELETE /api/drivers/:id
// Hard-deletes the driver record. Admin only.
export const deleteDriver = (id) =>
  api.delete(API.DRIVER(id));

// POST /api/drivers/:id/assign-partner
// Body: { partnerId }
// Response: { data: Driver }
export const assignDriverToPartner = (driverId, partnerId) =>
  api.post(API.DRIVER_ASSIGN(driverId), { partnerId });

// DELETE /api/drivers/:id/remove-partner
// Unlinks the driver from their current partner.
// Response: { data: Driver }
export const removeDriverFromPartner = (driverId) =>
  api.delete(API.DRIVER_REMOVE(driverId));
