import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Sidebar.module.css';

function NavItem({ to, icon, children, badge, badgeVariant = 'primary', onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
    >
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navLabel}>{children}</span>
      {badge != null && (
        <span className={`${styles.badge} ${badgeVariant === 'warn' ? styles.badgeWarn : ''}`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return <div className={styles.sectionLabel}>{children}</div>;
}

export default function Sidebar({ navGroups, open, onClose }) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="white" width={18} height={18}>
            <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4" stroke="white" strokeWidth="2"/>
            <line x1="10" y1="1" x2="10" y2="4" stroke="white" strokeWidth="2"/>
            <line x1="14" y1="1" x2="14" y2="4" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <div className={styles.logoText}>
          DMS
          <span>Driver Management</span>
        </div>
        {/* Close button on mobile */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Navigation groups */}
      <nav className={styles.nav}>
        {navGroups.map((group, gi) => (
          <div key={gi} className={styles.section}>
            {group.label && <SectionLabel>{group.label}</SectionLabel>}
            {group.items.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                badge={item.badge}
                badgeVariant={item.badgeVariant}
                onClick={onClose}
              >
                {item.label}
              </NavItem>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={styles.footer}>
        <div className={styles.userPill}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role?.toUpperCase()}</div>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}