import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={styles.icon}>
        <circle cx={11} cy={11} r={8} />
        <line x1={21} y1={21} x2={16.65} y2={16.65} />
      </svg>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
