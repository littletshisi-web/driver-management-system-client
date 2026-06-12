import styles from './DonutChart.module.css';

/**
 * segments: Array of { label: string, value: number, colour: string }
 * Renders an SVG donut chart with a legend.
 */
export default function DonutChart({ segments = [] }) {
  if (!segments.length) return null;

  const total  = segments.reduce((acc, s) => acc + s.value, 0);
  const r      = 40;
  const cx     = 55;
  const cy     = 55;
  const circ   = 2 * Math.PI * r;

  let offset = 0;
  const slices = segments.map((seg) => {
    const dash  = (seg.value / total) * circ;
    const gap   = circ - dash;
    const slice = { ...seg, dash, gap, offset };
    offset -= dash;
    return slice;
  });

  return (
    <div className={styles.wrap}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface3)" strokeWidth={14} />
        {/* Slices */}
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.colour}
            strokeWidth={14}
            strokeDasharray={`${s.dash.toFixed(2)} ${s.gap.toFixed(2)}`}
            strokeDashoffset={s.offset.toFixed(2)}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
      </svg>

      <div className={styles.legend}>
        {segments.map((s, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.dot} style={{ background: s.colour }} />
            <span className={styles.lbl}>{s.label}</span>
            <span className={styles.val}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
