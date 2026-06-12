import styles from './FormField.module.css';

/**
 * Wraps any form input with a label and optional error message.
 *
 * Props:
 *   label    string    — field label
 *   error    string    — validation error (shown in red below the input)
 *   required boolean   — adds asterisk to label
 *   children ReactNode — the actual <input>, <select>, or <textarea>
 */
export default function FormField({ label, error, required, children }) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      <div className={`${styles.control} ${error ? styles.hasError : ''}`}>
        {children}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
