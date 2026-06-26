import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import PartnerLayout from './layouts/PartnerLayout.jsx';
import DriverLayout from './layouts/DriverLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Drivers from './pages/Drivers.jsx';
import Partners from './pages/Partners.jsx';
import Tasks from './pages/Tasks.jsx';
import Pricing from './pages/Pricing.jsx';
import Reports from './pages/Reports.jsx';
import Areas from './pages/Areas.jsx';
import AuditLog from './pages/AuditLog.jsx';
import Help from './pages/Help.jsx';
import NotFound from './pages/NotFound.jsx';
import Spinner from './components/common/Spinner.jsx';
import { ROLES } from './constants/roles.js';

// Wraps routes that require authentication.
// Redirects to /login if no user session exists.
// Redirects to /dashboard if the user's role is not in allowedRoles.
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Selects the correct sidebar layout based on the authenticated user's role.
function RoleLayout() {
  const { user } = useAuth();
  if (user?.role === ROLES.ADMIN) return <AdminLayout />;
  if (user?.role === ROLES.PARTNER) return <PartnerLayout />;
  if (user?.role === ROLES.DRIVER) return <DriverLayout />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected shell — picks layout by role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="drivers"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PARTNER]}>
              <Drivers />
            </ProtectedRoute>
          }
        />

        <Route
          path="partners"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Partners />
            </ProtectedRoute>
          }
        />

        <Route path="tasks" element={<Tasks />} />

        <Route
          path="pricing"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Pricing />
            </ProtectedRoute>
          }
        />

        <Route path="reports" element={<Reports />} />

        <Route
          path="areas"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Areas />
            </ProtectedRoute>
          }
        />

        <Route
          path="audit"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AuditLog />
            </ProtectedRoute>
          }
        />

        <Route path="help" element={<Help />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}