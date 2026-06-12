import styles from './BarChart.module.css';

/**
 * data: Array of { label: string, value: number }
 * Renders a simple vertical bar chart using pure CSS/HTML — no external library needed.
 */
export default function BarChart({ data = [], accentIndex }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className={styles.chart}>
      {data.map((item, i) => {
        const heightPct = max > 0 ? Math.round((item.value / max) * 100) : 0;
        const isAccent  = i === (accentIndex ?? data.length - 4);
        return (
          <div key={i} className={styles.col}>
            <span className={styles.num}>{item.value}</span>
            <div
              className={`${styles.bar} ${isAccent ? styles.accent : ''}`}
              style={{ height: `${heightPct}%` }}
              title={`${item.label}: ${item.value}`}
            />
            <span className={styles.lbl}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
