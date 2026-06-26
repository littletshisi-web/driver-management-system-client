import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { useDrivers } from '../hooks/useDrivers.js';
import { useAreas } from '../hooks/useAreas.js';
import { createTask, updateTaskStatus } from '../api/taskApi.js';
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

// Must match the Task model ENUM values exactly
const STATUS_COLUMNS = [
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
  const [saving, setSaving]       = useState(false);

  const taskFilters = user?.role === ROLES.DRIVER ? { driverId: user.id } : {};
  const { tasks, loading, error, refetch } = useTasks(taskFilters);
  const { drivers } = useDrivers({ status: 'available' });
  const { areas }   = useAreas();

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
      } else {
        await createTask(formData);
      }
      toast('Task created successfully');
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create task', 'error');
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
          <Button variant="primary" onClick={() => setModalOpen(true)}>
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

                    {user?.role !== ROLES.ADMIN && key !== 'cancelled' && key !== 'delivered' && (
                      <div className={styles.taskActions}>
                        {key === 'assigned' && (
                          <button className={styles.progressBtn} onClick={() => handleStatusChange(task, 'in-transit')}>
                            Start →
                          </button>
                        )}
                        {key === 'in-transit' && (
                          <button className={styles.progressBtn} onClick={() => handleStatusChange(task, 'delivered')}>
                            Complete ✓
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Task"
        footer={<></>}
      >
        <TaskForm drivers={drivers} areas={areas} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </PageShell>
  );
}