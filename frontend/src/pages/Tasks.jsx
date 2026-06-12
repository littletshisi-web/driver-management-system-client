import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { useDrivers } from '../hooks/useDrivers.js';
import { useAreas } from '../hooks/useAreas.js';
import { createTask, updateTaskStatus } from '../api/taskApi.js';
import { ROLES } from '../constants/roles.js';
import { TASK_STATUS_LABELS, TASK_STATUS_COLOURS } from '../constants/taskStatuses.js';
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

const STATUS_COLUMNS = ['assigned', 'in_progress', 'completed', 'cancelled'];

export default function Tasks() {
  const { user } = useAuth();
  const toast    = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);

  // Driver only sees their own tasks
  const taskFilters = user?.role === ROLES.DRIVER ? { driverId: user.id } : {};
  const { tasks, loading, error, refetch } = useTasks(taskFilters);
  const { drivers }  = useDrivers({ status: 'available' });
  const { areas }    = useAreas();

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
      } else {
        await createTask(formData);
      }
      toast('Task created and assigned successfully');
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
      toast(`Task ${task.taskCode} moved to ${TASK_STATUS_LABELS[newStatus]}`);
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
        {STATUS_COLUMNS.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          const colColour   = TASK_STATUS_COLOURS[status];

          return (
            <div key={status} className={styles.column}>
              <div className={styles.colHead}>
                <span className={`${styles.colTitle} ${styles[colColour]}`}>
                  {TASK_STATUS_LABELS[status]}
                </span>
                <span className={styles.colCount}>{columnTasks.length}</span>
              </div>

              <div className={styles.cardList}>
                {columnTasks.length === 0 && (
                  <div className={styles.emptyCol}>No {TASK_STATUS_LABELS[status].toLowerCase()} tasks</div>
                )}

                {columnTasks.map((task) => (
                  <div key={task.id} className={styles.taskCard}>
                    <div className={styles.taskCode}>{task.taskCode}</div>
                    <div className={styles.taskMeta}>
                      {task.driver?.name} · {task.area?.name}
                    </div>
                    <div className={styles.taskFoot}>
                      <Badge colour={CATEGORY_COLOUR[task.category]}>
                        {CATEGORY_LABEL[task.category]}
                      </Badge>
                      <span className={styles.taskValue}>
                        {formatCurrency(task.finalPrice)}
                      </span>
                    </div>

                    {/* Status progression controls — only shown for non-cancelled tasks */}
                    {user?.role !== ROLES.ADMIN && status !== 'cancelled' && status !== 'completed' && (
                      <div className={styles.taskActions}>
                        {status === 'assigned' && (
                          <button className={styles.progressBtn} onClick={() => handleStatusChange(task, 'in_progress')}>
                            Start →
                          </button>
                        )}
                        {status === 'in_progress' && (
                          <button className={styles.progressBtn} onClick={() => handleStatusChange(task, 'completed')}>
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
