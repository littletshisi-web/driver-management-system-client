import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, logout as apiLogout } from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading = true while we're verifying the stored token on app start.
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists in localStorage, verify it with the backend.
  // If valid, setUser with the returned user object.
  // If invalid (401), the axiosInstance interceptor removes the token.
  useEffect(() => {
    const token = localStorage.getItem('dms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      // ✅ /api/auth/me returns { success: true, user: {...} } — unwrap .user,
      // not the whole wrapper object, or role checks downstream silently fail.
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('dms_token');
      })
      .finally(() => setLoading(false));
  }, []);

  // Called by the Login page after a successful POST /api/auth/login.
  const login = useCallback((token, userData) => {
    localStorage.setItem('dms_token', token);
    setUser(userData);
  }, []);

  // Called by the logout button in any layout.
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore errors — clear local state regardless.
    } finally {
      localStorage.removeItem('dms_token');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook — import { useAuth } in any component.
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};