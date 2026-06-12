import styles from './TableCard.module.css';

/**
 * TableCard is the white card that wraps every data table.
 *
 * Props:
 *   title     string    — card heading (left side)
 *   actions   ReactNode — buttons/controls on the right of the header
 *   children  ReactNode — the <table> element
 */
export default function TableCard({ title, actions, children }) {
  return (
    <div className={styles.card}>
      {(title || actions) && (
        <div className={styles.head}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.tableWrap}>
        {children}
      </div>
    </div>
  );
}
