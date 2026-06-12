import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// GET /api/partners
// Response: { data: Partner[], total: number }
export const getPartners = () =>
  api.get(API.PARTNERS);

// GET /api/partners/:id
// Response: Partner object
export const getPartner = (id) =>
  api.get(API.PARTNER(id));

// POST /api/partners
// Body: { name, contactName, email, phone, commissionPct, region }
// Response: { data: Partner }
export const createPartner = (data) =>
  api.post(API.PARTNERS, data);

// PUT /api/partners/:id
// Body: Partial partner fields
// Response: { data: Partner }
export const updatePartner = (id, data) =>
  api.put(API.PARTNER(id), data);

// GET /api/partners/:id/drivers
// Returns all drivers linked to this partner.
// Response: { data: Driver[] }
export const getPartnerDrivers = (partnerId) =>
  api.get(API.PARTNER_DRIVERS(partnerId));
