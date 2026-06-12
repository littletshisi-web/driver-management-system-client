import styles from './Button.module.css';
import Spinner from './Spinner.jsx';

/**
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size:    'default' | 'sm'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${size === 'sm' ? styles.sm : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}
