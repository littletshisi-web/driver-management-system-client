import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { useAreas } from '../hooks/useAreas.js';
import { createArea, updateArea } from '../api/areaApi.js';
import PageShell from '../components/layout/PageShell.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';
import AreaForm from '../components/forms/AreaForm.jsx';
import styles from './Areas.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const ZONE_COLOUR = { Standard: 'green', Extended: 'amber', Remote: 'red' };

export default function Areas() {
  const toast = useToast();
  const { areas, loading, error, refetch } = useAreas();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (a)  => { setEditing(a);  setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        if (editing) {
          await updateArea(editing.id, formData);
        } else {
          await createArea(formData);
        }
      }
      toast(editing ? 'Area updated successfully' : 'Area added successfully');
      closeModal();
      refetch();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save area', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Operational Areas">
        <div className={styles.loadingWrap}><Spinner size={28} /></div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Operational Areas"
      subtitle="Driver operational zones, pricing regions, and area modifiers"
      actions={
        <Button variant="primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Area
        </Button>
      }
    >
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className={styles.grid}>
        {areas.map((area) => (
          <div key={area.id} className={styles.card} onClick={() => openEdit(area)}>
            <h4 className={styles.areaName}>{area.name}</h4>
            <p className={styles.region}>{area.region}</p>
            <div className={styles.footer}>
              <span className={styles.driverCount}>{area.driverCount} drivers</span>
              <Badge colour={ZONE_COLOUR[area.zoneType] ?? 'gray'}>{area.zoneType}</Badge>
            </div>
            <div className={styles.modifier}>
              Price modifier <span className={styles.modValue}>×{area.priceModifier.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit — ${editing.name}` : 'Add Operational Area'}
        footer={<></>}
      >
        <AreaForm initial={editing ?? {}} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </PageShell>
  );
}
