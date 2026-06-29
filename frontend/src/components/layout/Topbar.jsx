import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './Topbar.module.css';

export default function Topbar({ title, children, onMenuOpen }) {
  const { mode, toggleTheme } = useTheme();

  return (
    <header className={styles.topbar}>
      {/* Hamburger — mobile only */}
      <button
        className={styles.menuBtn}
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className={styles.themeIcon}>{mode === 'dark' ? '☀️' : '🌙'}</span>
        </button>
        {children}
      </div>
    </header>
  );
}