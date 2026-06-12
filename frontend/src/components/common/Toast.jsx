import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
        <circle cx={12} cy={12} r={10} />
        <line x1={12} y1={8} x2={12} y2={12} />
        <line x1={12} y1={16} x2={12.01} y2={16} />
      </svg>
    ),
  };

  return (
    <div className={`${styles.toast} ${styles[type]} ${!visible ? styles.exit : ''}`}>
      <span className={styles.icon}>{icons[type] ?? icons.success}</span>
      <span>{message}</span>
    </div>
  );
}
