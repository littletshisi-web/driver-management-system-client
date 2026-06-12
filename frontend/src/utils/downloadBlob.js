/**
 * Triggers a browser file download from a Blob response.
 * Use with exportReport() which sets responseType: 'blob'.
 *
 * @param {Blob}   blob     - The response.data from the axios call.
 * @param {string} filename - e.g. "dms-report-2025-05.csv"
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
