import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';
import styles from './Layout.module.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/drivers':   'My Drivers',
  '/tasks':     'Task Board',
  '/reports':   'Reports',
  '/help':      'Help & Support',
};

const IconDashboard = () => <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IconDrivers   = () => <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const IconTasks     = () => <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconReports   = () => <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconHelp      = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const NAV_GROUPS = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard',  icon: <IconDashboard /> },
      { to: '/drivers',   label: 'My Drivers', icon: <IconDrivers />   },
      { to: '/tasks',     label: 'Tasks',      icon: <IconTasks />     },
      { to: '/reports',   label: 'Reports',    icon: <IconReports />   },
      { to: '/help',      label: 'Help',       icon: <IconHelp />      },
    ],
  },
];

export default function PartnerLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'DMS';

  return (
    <div className={styles.shell}>
      <Sidebar navGroups={NAV_GROUPS} />
      <div className={styles.main}>
        <Topbar title={title} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
