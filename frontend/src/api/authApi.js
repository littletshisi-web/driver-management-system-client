import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// POST /api/auth/login
// Body:     { email, password }
// Response: { token: string, user: { id, name, email, role } }
// If unverified: 403 { success: false, message, unverified: true }
export const login = (email, password) =>
  api.post(API.AUTH_LOGIN, { email, password });

// POST /api/auth/register
// Body:     { name, password, applicationToken }
// applicationToken must belong to an approved, unused DriverApplication —
// registration is closed to the public otherwise. Email and role are
// derived server-side from that application, not accepted from the client.
// Response: { success: true, message, user: { id, name, email, role } }
// Note: no token is returned — the account is unverified until the user
// clicks the link emailed to them.
export const register = (name, password, applicationToken) =>
  api.post(API.AUTH_REGISTER, { name, password, applicationToken });

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