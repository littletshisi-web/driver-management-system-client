import styles from './DonutChart.module.css';

/**
 * segments: Array of { label: string, value: number, colour: string }
 * Renders an SVG donut chart with a legend.
 */
export default function DonutChart({ segments = [] }) {
  if (!segments.length) return null;

  // API sends { label, value (%), count, colour }
  // Use `count` for accurate slice sizing; fall back to `value` if count absent
  const totalCount = segments.reduce((acc, s) => acc + (s.count ?? s.value), 0);

  const r    = 40;
  const cx   = 55;
  const cy   = 55;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const slices = segments.map((seg) => {
    const raw  = seg.count ?? seg.value;
    const dash = totalCount > 0 ? (raw / totalCount) * circ : 0;
    const gap  = circ - dash;
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
        {segments.map((s, i) => {
          const raw = s.count ?? s.value;
          const pct = totalCount > 0 ? Math.round((raw / totalCount) * 100) : 0;
          return (
            <div key={i} className={styles.item}>
              <span className={styles.dot} style={{ background: s.colour }} />
              <span className={styles.lbl}>{s.label}</span>
              <span className={styles.val}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}