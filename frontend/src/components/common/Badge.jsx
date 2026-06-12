import styles from './Badge.module.css';

/**
 * colour: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'teal' | 'gray'
 * dot: boolean — shows a coloured dot before the label
 */
export default function Badge({ children, colour = 'gray', dot = false }) {
  return (
    <span className={`${styles.badge} ${styles[colour]}`}>
      {dot && <span className={`${styles.dot} ${styles[`dot_${colour}`]}`} />}
      {children}
    </span>
  );
}
