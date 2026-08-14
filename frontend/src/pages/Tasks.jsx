import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { useDrivers } from '../hooks/useDrivers.js';
import { useAreas } from '../hooks/useAreas.js';
import { createTask, updateTask, updateTaskStatus } from '../api/taskApi.js';
import { ROLES } from '../constants/roles.js';
import { CATEGORY_LABEL, CATEGORY_COLOUR } from '../constants/taskCategories.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import PageShell from '../components/layout/PageShell.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';
import TaskForm from '../components/forms/TaskForm.jsx';
import styles from './Tasks.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Must match the Task model ENUM values exactly.
// NOTE: the Task model's `status` column defaults to 'pending', so a
// "pending" column must exist here — otherwise any task created without
// an explicit status (e.g. no driver assigned yet) is created successfully
// but never appears in any column on the board.
const STATUS_COLUMNS = [
  { key: 'pending',    label: 'Pending',     colour: 'gray'   },
  { key: 'assigned',   label: 'Assigned',    colour: 'amber'  },
  { key: 'in-transit', label: 'In Progress', colour: 'blue'   },
  { key: 'delivered',  label: 'Completed',   colour: 'green'  },
  { key: 'cancelled',  label: 'Cancelled',   colour: 'red'    },
];

const driverName = (task) => {
  const d = task.Driver;
  if (!d) return '—';
  return `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || '—';
};

export default function Tasks() {
  const { user } = useAuth();
  const toast    = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (task) => { setEditing(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const taskFilters = user?.role === ROLES.DRIVER ? { driverId: user.driverId } : {};
  const { tasks, loading, error, refetch } = useTasks(taskFilters);
  // Partners should only be able to assign their own drivers — the backend
  // also enforces this server-side, but pass it explicitly here too so the
  // dropdown isn't populated with (or emptied by) other partners' drivers.
  const driverFilters = user?.role === ROLES.PARTNER ? { status: 'active', partnerId: user.partnerId } : { status: 'active' };
  const { drivers } = useDrivers(driverFilters);
  const { areas }   = useAreas();

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
      } else if (editing) {
        await updateTask(editing.id, formData);
      } else {
        await createTask(formData);
      }
      toast(editing ? 'Task updated successfully' : 'Task created successfully');
      closeModal();
      refetch();
    } catch (err) {
      toast(err.response?.data?.message || `Failed to ${editing ? 'update' : 'create'} task`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      if (!USE_MOCK) await updateTaskStatus(task.id, newStatus);
      toast(`Task ${task.taskCode} updated`);
      refetch();
    } catch {
      toast('Failed to update task status', 'error');
    }
  };

  const handleCancel = (task) => {
    if (!window.confirm(`Cancel task ${task.taskCode}? This can't be undone.`)) return;
    handleStatusChange(task, 'cancelled');
  };

  if (loading) {
    return (
      <PageShell title="Task Board">
        <div className={styles.loadingFull}><Spinner size={28} /></div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Task Board"
      subtitle="Kanban view of all operational tasks"
      actions={
        user?.role !== ROLES.DRIVER && (
          <Button variant="primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Task
          </Button>
        )
      }
    >
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className={styles.board}>
        {STATUS_COLUMNS.map(({ key, label, colour }) => {
          const columnTasks = tasks.filter((t) => t.status === key);

          return (
            <div key={key} className={styles.column}>
              <div className={styles.colHead}>
                <span className={`${styles.colTitle} ${styles[colour]}`}>{label}</span>
                <span className={styles.colCount}>{columnTasks.length}</span>
              </div>

              <div className={styles.cardList}>
                {columnTasks.length === 0 && (
                  <div className={styles.emptyCol}>No {label.toLowerCase()} tasks</div>
                )}

                {columnTasks.map((task) => (
                  <div key={task.id} className={styles.taskCard}>
                    <div className={styles.taskCode}>{task.taskCode}</div>
                    <div className={styles.taskMeta}>
                      {driverName(task)} · {task.pickupAddress}
                    </div>
                    <div className={styles.taskFoot}>
                      <Badge colour={CATEGORY_COLOUR[task.category] ?? 'gray'}>
                        {CATEGORY_LABEL[task.category] ?? task.category}
                      </Badge>
                      <span className={styles.taskValue}>
                        {formatCurrency(task.totalFare ?? 0)}
                      </span>
                    </div>

                    <div className={styles.taskActions}>
                      {user?.role !== ROLES.DRIVER && key !== 'delivered' && key !== 'cancelled' && (
                        <button className={styles.editBtn} onClick={() => openEdit(task)}>
                          Edit
                        </button>
                      )}
                      {user?.role !== ROLES.ADMIN && key !== 'cancelled' && key !== 'delivered' && (
                        <>
                          {/* A task can have a driver but still sit in 'pending' status —
                              treat that the same as 'assigned' so it isn't a dead end
                              with no way to progress it. */}
                          {(key === 'assigned' || (key === 'pending' && task.driverId)) && (
                            <button className={styles.progressBtn} onClick={() => handleStatusChange(task, 'in-transit')}>
                              Start →
                            </button>
                          )}
                          {key === 'in-transit' && (
                            <button className={styles.progressBtn} onClick={() => handleStatusChange(task, 'delivered')}>
                              Complete ✓
                            </button>
                          )}
                        </>
                      )}
                      {user?.role !== ROLES.DRIVER && key !== 'delivered' && key !== 'cancelled' && (
                        <button className={styles.cancelBtn} onClick={() => handleCancel(task)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit — ${editing.taskCode}` : 'Create New Task'}
        footer={<></>}
      >
        <TaskForm initial={editing ?? {}} drivers={drivers} areas={areas} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </PageShell>
  );
}