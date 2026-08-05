import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { useApplications } from '../hooks/useApplications.js';
import { approveApplication, rejectApplication } from '../api/applicationApi.js';
import PageShell from '../components/layout/PageShell.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import EmptyState from '../components/tables/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';
import styles from './Applications.module.css';

// Uploaded documents are served from the API's static /uploads path, not
// under /api — strip the /api suffix from the configured base to get there.
const FILE_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/api\/?$/, '');

const STATUS_TABS = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: '',          label: 'All' },
];

const TYPE_LABEL = {
  driver_no_vehicle:   'Driver (No Vehicle)',
  driver_with_vehicle: 'Driver (Own Vehicle)',
  partner:              'Partner (Fleet)',
};

const STATUS_COLOUR = { pending: 'amber', approved: 'green', rejected: 'red' };

export default function Applications() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const { applications, loading, error, refetch } = useApplications(status);

  const [viewing, setViewing]   = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason]     = useState('');
  const [busy, setBusy]         = useState(false);

  const closeModals = () => { setViewing(null); setRejecting(null); setReason(''); };

  const handleApprove = async (application) => {
    setBusy(true);
    try {
      await approveApplication(application.id);
      toast(`${application.firstName} ${application.lastName} approved — registration link emailed.`);
      closeModals();
      refetch();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to approve application', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setBusy(true);
    try {
      await rejectApplication(rejecting.id, reason.trim());
      toast(`${rejecting.firstName} ${rejecting.lastName}'s application rejected.`);
      closeModals();
      refetch();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to reject application', 'error');
    } finally {
      setBusy(false);
    }
  };

  const docLink = (path, label) =>
    path ? <a href={`${FILE_BASE}${path}`} target="_blank" rel="noreferrer" className={styles.docLink}>{label}</a>
         : <span className={styles.docMissing}>Not provided</span>;

  return (
    <PageShell title="Driver Applications" subtitle="Review and approve driver / partner applications submitted publicly">
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className={styles.tabs}>
        {STATUS_TABS.map((t) => (
          <button
            key={t.value || 'all'}
            className={`${styles.tab} ${status === t.value ? styles.tabActive : ''}`}
            onClick={() => setStatus(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <TableCard title="Applications">
        {loading ? (
          <div className={styles.loadingRow}><Spinner size={22} /></div>
        ) : applications.length === 0 ? (
          <EmptyState message="No applications here." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td><span className={styles.name}>{a.firstName} {a.lastName}</span></td>
                  <td>{TYPE_LABEL[a.applicantType] || a.applicantType}</td>
                  <td>
                    <div>{a.email}</div>
                    <div className={styles.muted}>{a.phone}</div>
                  </td>
                  <td>{a.city || '—'}</td>
                  <td><Badge colour={STATUS_COLOUR[a.status]}>{a.status}</Badge></td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => setViewing(a)}>Review</Button>
                      {a.status === 'pending' && (
                        <>
                          <Button variant="primary" size="sm" onClick={() => handleApprove(a)}>Approve</Button>
                          <Button variant="danger" size="sm" onClick={() => setRejecting(a)}>Reject</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      {/* Review modal — full detail + documents */}
      <Modal open={!!viewing} onClose={closeModals} title={viewing ? `${viewing.firstName} ${viewing.lastName}` : ''} footer={<></>}>
        {viewing && (
          <div className={styles.reviewGrid}>
            <div><span className={styles.reviewLabel}>Applying as</span><div>{TYPE_LABEL[viewing.applicantType] || viewing.applicantType}</div></div>
            <div><span className={styles.reviewLabel}>Status</span><div><Badge colour={STATUS_COLOUR[viewing.status]}>{viewing.status}</Badge></div></div>
            <div><span className={styles.reviewLabel}>Email</span><div>{viewing.email}</div></div>
            <div><span className={styles.reviewLabel}>Phone</span><div>{viewing.phone}</div></div>
            <div><span className={styles.reviewLabel}>ID number</span><div>{viewing.idNumber || '—'}</div></div>
            <div><span className={styles.reviewLabel}>Location</span><div>{viewing.city || '—'}</div></div>
            {viewing.vehicleType && <div><span className={styles.reviewLabel}>Vehicle info</span><div>{viewing.vehicleType}</div></div>}
            {viewing.fleetSize && <div><span className={styles.reviewLabel}>Fleet size</span><div>{viewing.fleetSize}</div></div>}
            {viewing.notes && <div style={{ gridColumn: '1 / -1' }}><span className={styles.reviewLabel}>Availability / notes</span><div>{viewing.notes}</div></div>}
            {Array.isArray(viewing.serviceInterest) && viewing.serviceInterest.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span className={styles.reviewLabel}>Services interested in</span>
                <div>{viewing.serviceInterest.join(', ')}</div>
              </div>
            )}
            <div style={{ gridColumn: '1 / -1' }}>
              <span className={styles.reviewLabel}>Documents</span>
              <div className={styles.docList}>
                {docLink(viewing.idDocUrl, 'ID copy')}
                {docLink(viewing.licenceDocUrl, "Driver's license")}
                {docLink(viewing.discDocUrl, 'Disc certification')}
                {docLink(viewing.photoUrl, 'Profile photo')}
              </div>
            </div>
            {viewing.status === 'rejected' && viewing.rejectionReason && (
              <div style={{ gridColumn: '1 / -1' }}><span className={styles.reviewLabel}>Rejection reason</span><div>{viewing.rejectionReason}</div></div>
            )}

            {viewing.status === 'pending' && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 8 }}>
                <Button variant="primary" onClick={() => handleApprove(viewing)} disabled={busy}>Approve</Button>
                <Button variant="danger" onClick={() => { setRejecting(viewing); setViewing(null); }}>Reject</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject modal — optional reason */}
      <Modal
        open={!!rejecting}
        onClose={closeModals}
        title={rejecting ? `Reject — ${rejecting.firstName} ${rejecting.lastName}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={closeModals}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={busy}>{busy ? 'Rejecting…' : 'Reject application'}</Button>
          </>
        }
      >
        <div className={styles.field}>
          <label className={styles.label}>Reason (optional — included in the applicant's email)</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={300}
          />
        </div>
      </Modal>
    </PageShell>
  );
}
