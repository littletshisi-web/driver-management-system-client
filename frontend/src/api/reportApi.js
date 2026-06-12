import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// GET /api/reports/tasks
// Params: { from, to, partnerId?, driverId? }
// Response: { data: TaskReport[], summary: { total, completed, cancelled } }
export const getTaskReport = (params = {}) =>
  api.get(API.REPORTS_TASKS, { params });

// GET /api/reports/earnings
// Params: { from, to, partnerId?, driverId? }
// Response: { data: EarningsReport[], totals: { gross, net } }
export const getEarningsReport = (params = {}) =>
  api.get(API.REPORTS_EARNINGS, { params });

// GET /api/reports/export
// Params: { type: 'csv' | 'pdf', from, to, ... }
// Response: Binary blob (application/pdf or text/csv)
// The caller is responsible for triggering a file download.
export const exportReport = (type, params = {}) =>
  api.get(API.REPORTS_EXPORT, {
    params: { type, ...params },
    responseType: 'blob',
  });
