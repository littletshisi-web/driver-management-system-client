import styles from './ErrorBanner.module.css';
import Button from './Button.jsx';

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className={styles.banner}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
        <circle cx={12} cy={12} r={10} />
        <line x1={12} y1={8} x2={12} y2={12} />
        <line x1={12} y1={16} x2={12.01} y2={16} />
      </svg>
      <span className={styles.message}>{message}</span>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>
      )}
    </div>
  );
}
