import styles from './EmptyState.module.css';

export default function EmptyState({ message = 'No data found.', action }) {
  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={styles.icon}>
        <circle cx={12} cy={12} r={10} />
        <line x1={12} y1={8} x2={12} y2={12} />
        <line x1={12} y1={16} x2={12.01} y2={16} />
      </svg>
      <p className={styles.message}>{message}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
