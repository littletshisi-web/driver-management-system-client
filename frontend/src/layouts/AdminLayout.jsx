import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';
import styles from './Layout.module.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/drivers':   'Drivers',
  '/partners':  'Partners',
  '/tasks':     'Task Board',
  '/pricing':   'Pricing',
  '/reports':   'Reports & Analytics',
  '/areas':     'Operational Areas',
  '/audit':     'Audit Log',
  '/help':      'Help & FAQ',
};

const IconDashboard  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IconDrivers    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPartners   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconTasks      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconAreas      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;
const IconPricing    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconReports    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconAudit      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconHelp       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> }],
  },
  {
    label: 'Management',
    items: [
      { to: '/drivers',  label: 'Drivers',  icon: <IconDrivers />  },
      { to: '/partners', label: 'Partners', icon: <IconPartners /> },
      { to: '/tasks',    label: 'Tasks',    icon: <IconTasks />    },
      { to: '/areas',    label: 'Areas',    icon: <IconAreas />    },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/pricing', label: 'Pricing', icon: <IconPricing /> },
      { to: '/reports', label: 'Reports', icon: <IconReports /> },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/audit', label: 'Audit Log',  icon: <IconAudit /> },
      { to: '/help',  label: 'Help & FAQ', icon: <IconHelp />  },
    ],
  },
];

// Driver bottom nav — only 4 key items for mobile
const DRIVER_BOTTOM_NAV = [
  { to: '/dashboard', label: 'Home',     icon: <IconDashboard /> },
  { to: '/tasks',     label: 'Tasks',    icon: <IconTasks />     },
  { to: '/reports',   label: 'Earnings', icon: <IconReports />   },
  { to: '/help',      label: 'Help',     icon: <IconHelp />      },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] || 'DMS';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDriver = user?.role === ROLES.DRIVER;

  return (
    <div className={styles.shell}>
      {/* Overlay for mobile sidebar */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        navGroups={NAV_GROUPS}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.main}>
        <Topbar title={title} onMenuOpen={() => setSidebarOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* Bottom nav for drivers on mobile */}
      {isDriver && (
        <nav className={styles.bottomNav}>
          {DRIVER_BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.bottomNavItem} ${isActive ? styles.bottomNavActive : ''}`
              }
            >
              <span className={styles.bottomNavIcon}>{item.icon}</span>
              <span className={styles.bottomNavLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}