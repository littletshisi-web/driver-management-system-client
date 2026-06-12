import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { usePartners } from '../hooks/usePartners.js';
import { createPartner, updatePartner } from '../api/partnerApi.js';
import PageShell from '../components/layout/PageShell.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import EmptyState from '../components/tables/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';
import PartnerForm from '../components/forms/PartnerForm.jsx';
import styles from './Partners.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function Partners() {
  const toast = useToast();
  const { partners, loading, error, refetch } = usePartners();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (p)  => { setEditing(p);  setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        toast(editing ? 'Partner updated' : 'Partner created successfully');
        closeModal();
        refetch();
      } else {
        if (editing) {
          await updatePartner(editing.id, formData);
          toast('Partner updated');
        } else {
          await createPartner(formData);
          toast('Partner created successfully');
        }
        closeModal();
        refetch();
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save partner', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Partners"
      subtitle="Manage partner companies and their assigned drivers"
      actions={
        <Button variant="primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Partner
        </Button>
      }
    >
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <TableCard title="All partners">
        {loading ? (
          <div className={styles.loadingRow}><Spinner size={22} /></div>
        ) : partners.length === 0 ? (
          <EmptyState message="No partners yet." action={<Button variant="secondary" size="sm" onClick={openCreate}>Add first partner</Button>} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Commission</th>
                <th>Drivers</th>
                <th>Active Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td><span className={styles.companyName}>{p.name}</span></td>
                  <td>{p.contactName}</td>
                  <td><a href={`mailto:${p.email}`} className={styles.email}>{p.email}</a></td>
                  <td><span className={styles.commission}>{p.commissionPct}%</span></td>
                  <td><Badge colour="blue">{p.driverCount} drivers</Badge></td>
                  <td><Badge colour="amber">{p.activeTaskCount} active</Badge></td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => toast(`Viewing ${p.name} drivers`)}>View Drivers</Button>
                      <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit — ${editing.name}` : 'Add New Partner'}
        footer={<></>}
      >
        <PartnerForm initial={editing ?? {}} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </PageShell>
  );
}
