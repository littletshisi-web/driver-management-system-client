import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDrivers } from '../hooks/useDrivers.js';
import { useAreas } from '../hooks/useAreas.js';
import { usePartners } from '../hooks/usePartners.js';
import { createDriver, updateDriver, suspendDriver } from '../api/driverApi.js';
import { ROLES } from '../constants/roles.js';
import PageShell from '../components/layout/PageShell.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import SearchBar from '../components/tables/SearchBar.jsx';
import EmptyState from '../components/tables/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';
import DriverForm from '../components/forms/DriverForm.jsx';
import styles from './Drivers.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const STATUS_COLOUR = { available: 'green', busy: 'amber', inactive: 'red' };
const STATUS_LABEL  = { available: 'Available', busy: 'Busy', inactive: 'Inactive' };

// Assigns a consistent avatar colour to each driver based on their ID
const AVATAR_COLOURS = ['blue', 'purple', 'teal', 'amber', 'red', 'green'];
const avatarColour = (id) => AVATAR_COLOURS[(id - 1) % AVATAR_COLOURS.length];

const AVATAR_STYLES = {
  blue:   { background: 'var(--accent-light)', color: 'var(--accent)',  border: 'rgba(30,58,95,0.2)'   },
  purple: { background: 'var(--purple-bg)',    color: 'var(--purple)',  border: 'rgba(74,32,128,0.2)'  },
  teal:   { background: 'var(--teal-bg)',      color: 'var(--teal)',    border: 'rgba(13,92,92,0.2)'   },
  amber:  { background: 'var(--amber-bg)',     color: 'var(--amber)',   border: 'rgba(138,90,0,0.2)'   },
  red:    { background: 'var(--red-bg)',       color: 'var(--red)',     border: 'rgba(139,26,26,0.2)'  },
  green:  { background: 'var(--green-bg)',     color: 'var(--green)',   border: 'rgba(26,107,60,0.2)'  },
};

export default function Drivers() {
  const { user } = useAuth();
  const toast    = useToast();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState(null);   // null = create, object = edit
  const [saving, setSaving]           = useState(false);

  // Partner users only see their own drivers
  const filters = {
    search,
    status: statusFilter,
    ...(user?.role === ROLES.PARTNER ? { partnerId: user.id } : {}),
  };

  const { drivers, loading, error, refetch } = useDrivers(filters);
  const { areas }                            = useAreas();
  const { partners }                         = usePartners();

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (driver) => { setEditing(driver); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600)); // simulate latency
        toast(editing ? 'Driver updated successfully' : 'Driver created successfully');
        closeModal();
        refetch();
      } else {
        if (editing) {
          await updateDriver(editing.id, formData);
          toast('Driver updated successfully');
        } else {
          await createDriver(formData);
          toast('Driver created successfully');
        }
        closeModal();
        refetch();
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save driver', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async (driver) => {
    if (!window.confirm(`Suspend ${driver.name}? They will be set to inactive.`)) return;
    try {
      if (!USE_MOCK) await suspendDriver(driver.id);
      toast(`${driver.name} has been suspended`);
      refetch();
    } catch {
      toast('Failed to suspend driver', 'error');
    }
  };

  return (
    <PageShell
      title={user?.role === ROLES.PARTNER ? 'My Drivers' : 'Drivers'}
      subtitle="Manage driver profiles, assignments, and availability"
      actions={
        user?.role !== ROLES.DRIVER && (
          <Button variant="primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Driver
          </Button>
        )
      }
    >
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <TableCard
        actions={
          <div className={styles.tableControls}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search name or license…" />
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <div className={styles.loadingRow}><Spinner size={22} /></div>
        ) : drivers.length === 0 ? (
          <EmptyState
            message="No drivers found. Try adjusting your filters."
            action={user?.role === ROLES.ADMIN && <Button variant="secondary" size="sm" onClick={openCreate}>Add first driver</Button>}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>License</th>
                <th>Vehicle</th>
                <th>Area</th>
                <th>Partner</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const ac = avatarColour(driver.id);
                const av = AVATAR_STYLES[ac];
                const initials = driver.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={driver.id}>
                    <td>
                      <div className={styles.driverCell}>
                        <div
                          className={styles.avatar}
                          style={{ background: av.background, color: av.color, borderColor: av.border }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className={styles.driverName}>{driver.name}</div>
                          <div className={styles.driverId}>#DRV-{String(driver.id).padStart(3, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.mono}>{driver.licenseNumber}</td>
                    <td>
                      <span className={styles.vehicleName}>{driver.vehicleType}</span>
                      <span className={styles.vehicleReg}>{driver.vehicleReg}</span>
                    </td>
                    <td>{driver.area?.name ?? '—'}</td>
                    <td>
                      {driver.partner
                        ? <Badge colour="blue">{driver.partner.name}</Badge>
                        : <Badge colour="gray">Unpartnered</Badge>
                      }
                    </td>
                    <td>
                      <Badge colour={STATUS_COLOUR[driver.availabilityStatus]} dot>
                        {STATUS_LABEL[driver.availabilityStatus]}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(driver)}>Edit</Button>
                        {user?.role === ROLES.ADMIN && driver.availabilityStatus !== 'inactive' && (
                          <Button variant="danger" size="sm" onClick={() => handleSuspend(driver)}>Suspend</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableCard>

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit — ${editing.name}` : 'Add New Driver'}
        footer={<></>}
      >
        <DriverForm
          initial={editing ?? {}}
          areas={areas}
          partners={partners}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </Modal>
    </PageShell>
  );
}
