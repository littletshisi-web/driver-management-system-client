import styles from './ActivityFeed.module.css';
import { relativeDate } from '../../utils/formatDate.js';

/**
 * items: Array of { icon: ReactNode, colour: string, message: string, timestamp: string }
 * colour: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'teal'
 */
export default function ActivityFeed({ items = [] }) {
  if (!items.length) {
    return <div className={styles.empty}>No recent activity.</div>;
  }

  return (
    <div className={styles.feed}>
      {items.map((item, i) => (
        <div key={i} className={styles.item}>
          <div className={`${styles.iconWrap} ${styles[item.colour]}`}>
            {item.icon}
          </div>
          <div className={styles.body}>
            <p className={styles.message}>{item.message}</p>
            <span className={styles.time}>
              {item.timestamp ? relativeDate(item.timestamp) : item.timeLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
