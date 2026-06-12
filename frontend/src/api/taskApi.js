import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// GET /api/tasks
// Params: { status, driverId, partnerId, page, limit }
// Response: { data: Task[], total: number, page: number, limit: number }
export const getTasks = (params = {}) =>
  api.get(API.TASKS, { params });

// GET /api/tasks/:id
// Response: Task object
export const getTask = (id) =>
  api.get(API.TASK(id));

// POST /api/tasks
// Body: { category, driverId, partnerId?, areaId, distanceKm, pickupAddress, deliveryAddress }
// Response: { data: Task } — task code is generated server-side
export const createTask = (data) =>
  api.post(API.TASKS, data);

// PATCH /api/tasks/:id/status
// Body: { status } — one of: assigned | in_progress | completed | cancelled
// Response: { data: Task }
export const updateTaskStatus = (id, status) =>
  api.patch(API.TASK_STATUS(id), { status });

// POST /api/tasks/:id/assign
// Body: { driverId }
// Re-assigns the task to a different driver.
// Response: { data: Task }
export const assignTask = (taskId, driverId) =>
  api.post(API.TASK_ASSIGN(taskId), { driverId });

// DELETE /api/tasks/:id
// Hard-deletes a task. Admin only.
export const deleteTask = (id) =>
  api.delete(API.TASK(id));
