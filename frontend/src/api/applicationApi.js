import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// POST /api/applications — public, multipart/form-data
// FormData fields: applicantType, firstName, lastName, email, phone, idNumber,
// city, vehicleType, vehicleReg, fleetSize, serviceInterest (JSON string), notes,
// idDoc, licenceDoc, discDoc, photo (files)
// Response: { success: true, message, data: { id } }
export const submitApplication = (formData) =>
  // Content-Type: undefined lets the browser set the correct multipart
  // boundary itself — the shared axios instance otherwise forces JSON.
  api.post(API.APPLICATIONS, formData, { headers: { 'Content-Type': undefined } });

// GET /api/applications/verify-token/:token — public
// Response: { success: true, data: { firstName, lastName, email, applicantType } }
export const verifyApplicationToken = (token) =>
  api.get(API.APPLICATION_VERIFY_TOKEN(token));

// GET /api/applications — admin. Params: { status, page, limit }
// Response: { data: Application[], pagination }
export const getApplications = (params) =>
  api.get(API.APPLICATIONS, { params });

// GET /api/applications/:id — admin
export const getApplication = (id) =>
  api.get(API.APPLICATION(id));

// PATCH /api/applications/:id/approve — admin
export const approveApplication = (id) =>
  api.patch(API.APPLICATION_APPROVE(id));

// PATCH /api/applications/:id/reject — admin. Body: { reason }
export const rejectApplication = (id, reason) =>
  api.patch(API.APPLICATION_REJECT(id), { reason });
