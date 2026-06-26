import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// POST /api/auth/login
// Body:     { email, password }
// Response: { token: string, user: { id, name, email, role } }
// If unverified: 403 { success: false, message, unverified: true }
export const login = (email, password) =>
  api.post(API.AUTH_LOGIN, { email, password });

// POST /api/auth/register
// Body:     { name, email, password, role }
// role must be 'driver' or 'partner' — 'admin' is rejected server-side.
// Response: { success: true, message, user: { id, name, email, role } }
// Note: no token is returned — the account is unverified until the user
// clicks the link emailed to them.
export const register = (name, email, password, role) =>
  api.post(API.AUTH_REGISTER, { name, email, password, role });

// GET /api/auth/verify-email?token=...
// Response: { success: true, message }
export const verifyEmail = (token) =>
  api.get(`${API.AUTH_VERIFY_EMAIL}?token=${encodeURIComponent(token)}`);

// POST /api/auth/resend-verification
// Body: { email }
// Always returns a generic success message, regardless of whether the
// email exists — avoids leaking which addresses are registered.
export const resendVerification = (email) =>
  api.post(API.AUTH_RESEND_VERIFICATION, { email });

// POST /api/auth/logout
export const logout = () =>
  api.post(API.AUTH_LOGOUT);

// GET /api/auth/me
export const getMe = () =>
  api.get(API.AUTH_ME);