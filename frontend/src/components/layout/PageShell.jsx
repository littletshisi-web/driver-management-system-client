import styles from './PageShell.module.css';

/**
 * PageShell wraps every page with consistent structure.
 *
 * Props:
 *   title       string    — page heading
 *   subtitle    string    — optional subtext below the heading
 *   actions     ReactNode — buttons rendered top-right
 *   children    ReactNode — page body content
 */
export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
