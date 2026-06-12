/**
 * Formats an ISO 8601 date string to a human-readable form.
 * e.g. formatDate("2025-05-14T09:32:00Z") → "14 May 2025, 09:32"
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-ZA', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns a relative time string for recent dates.
 * e.g. "2 hours ago", "Yesterday", "14 May 2025"
 */
export function relativeDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const now  = new Date();
  const diff = (now - date) / 1000; // seconds

  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';

  return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}
