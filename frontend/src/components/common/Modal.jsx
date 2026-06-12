import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';
import Button from './Button.jsx';

/**
 * Modal component with Portal rendering.
 * Props:
 *   open       boolean   — controls visibility
 *   onClose    function  — called when backdrop or × is clicked
 *   title      string    — modal heading
 *   children   ReactNode — modal body content
 *   footer     ReactNode — optional custom footer; defaults to Cancel + confirm button
 *   onConfirm  function  — used by default footer
 *   confirmLabel string  — label for the confirm button (default: "Save")
 *   loading    boolean   — shows spinner on confirm button
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  onConfirm,
  confirmLabel = 'Save',
  loading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Body */}
        <div className={styles.body}>{children}</div>

        {/* Footer */}
        <div className={styles.footer}>
          {footer ?? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
