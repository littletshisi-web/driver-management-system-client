import styles from './StatCard.module.css';

/**
 * colour: 'blue' | 'green' | 'amber' | 'purple' | 'teal' | 'red'
 */
export default function StatCard({ label, value, sub, colour = 'blue', icon }) {
  return (
    <div className={`${styles.card} ${styles[colour]}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
      {icon && (
        <div className={`${styles.icon} ${styles[`icon_${colour}`]}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
