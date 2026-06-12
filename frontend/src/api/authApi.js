import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// POST /api/auth/login
// Body:     { email, password }
// Response: { token: string, user: { id, name, email, role } }
export const login = (email, password) =>
  api.post(API.AUTH_LOGIN, { email, password });

// POST /api/auth/logout
// Invalidates the token server-side (if the backend implements token blacklisting).
export const logout = () =>
  api.post(API.AUTH_LOGOUT);

// GET /api/auth/me
// Returns the currently authenticated user from their JWT.
// Response: { id, name, email, role }
export const getMe = () =>
  api.get(API.AUTH_ME);
