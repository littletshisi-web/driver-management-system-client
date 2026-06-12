import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './Topbar.module.css';

export default function Topbar({ title, children }) {
  const { mode, toggleTheme } = useTheme();

  return (
    <header className={styles.topbar}>
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
