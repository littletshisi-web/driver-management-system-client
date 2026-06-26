import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { exportReport } from '../api/reportApi.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { ROLES } from '../constants/roles.js';
import api from '../api/axiosInstance.js';
import PageShell from '../components/layout/PageShell.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import styles from './Reports.module.css';

const AVATAR_COLOURS = ['blue', 'purple', 'teal', 'amber', 'red', 'green'];
const AVATAR_STYLES = {
  blue:   { background: 'var(--accent-light)', color: 'var(--accent)',  border: 'rgba(30,58,95,0.2)'  },
  purple: { background: 'var(--purple-bg)',    color: 'var(--purple)',  border: 'rgba(74,32,128,0.2)' },
  teal:   { background: 'var(--teal-bg)',      color: 'var(--teal)',    border: 'rgba(13,92,92,0.2)'  },
  amber:  { background: 'var(--amber-bg)',     color: 'var(--amber)',   border: 'rgba(138,90,0,0.2)'  },
  red:    { background: 'var(--red-bg)',       color: 'var(--red)',     border: 'rgba(139,26,26,0.2)' },
  green:  { background: 'var(--green-bg)',     color: 'var(--green)',   border: 'rgba(26,107,60,0.2)' },
};

const avatarColour = (id) => {
  const str = String(id ?? '');
  const hash = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLOURS[hash % AVATAR_COLOURS.length];
};

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

const MONTH_LABEL = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

export default function Reports() {
  const toast    = useToast();
  const { user } = useAuth();

  const [earnings, setEarnings]   = useState([]);
  const [summary, setSummary]     = useState({ gross: 0, taskCount: 0, avgValue: 0, activeDrivers: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { from, to } = monthRange();

        const [earningsRes, tasksRes, driversRes] = await Promise.all([
          api.get(`/reports/earnings?from=${from}&to=${to}`),
          api.get(`/reports/tasks?from=${from}&to=${to}`),
          api.get('/drivers/stats'),
        ]);

        const earningsData = earningsRes.data.data ?? [];
        const gross        = earningsRes.data.totals?.gross ?? 0;
        const taskSummary  = tasksRes.data.summary ?? {};
        const activeDrivers = driversRes.data.data?.active ?? 0;

        // Group earnings by driver
        const byDriver = {};
        earningsData.forEach((e) => {
          const id = e.driverId;
          if (!byDriver[id]) {
            byDriver[id] = {
              id,
              name: e.Driver ? `${e.Driver.firstName} ${e.Driver.lastName}`.trim() : 'Unknown',
              gross: 0,
              taskCount: 0,
            };
          }
          byDriver[id].gross += e.amount || 0;
          byDriver[id].taskCount += 1;
        });

        const rows = Object.values(byDriver);
        const avgValue = taskSummary.total > 0 ? Math.round(gross / taskSummary.total) : 0;

        setEarnings(rows);
        setSummary({
          gross,
          taskCount: taskSummary.completed ?? 0,
          avgValue,
          activeDrivers,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.role]);

  const handleExport = async (type) => {
    try {
      const res = await exportReport(type, { from: monthRange().from, to: monthRange().to });
      downloadBlob(res.data, `dms-report-${Date.now()}.${type}`);
      toast(`${type.toUpperCase()} exported successfully`);
    } catch {
      toast('Export failed — please try again', 'error');
    }
  };

  return (
    <PageShell
      title="Reports & Analytics"
      subtitle="Operational and financial reporting with export support"
      actions={
        <>
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Export PDF
          </Button>
        </>
      }
    >
      {/* Summary stats */}
      <div className={styles.statGrid}>
        <StatCard label="Monthly Earnings"  value={formatCurrency(summary.gross)}      sub={MONTH_LABEL}        colour="green"  />
        <StatCard label="Tasks Completed"   value={String(summary.taskCount)}           sub="This month"         colour="blue"   />
        <StatCard label="Avg Task Value"    value={formatCurrency(summary.avgValue)}    sub="All categories"     colour="amber"  />
        <StatCard label="Active Drivers"    value={String(summary.activeDrivers)}       sub="Currently active"   colour="purple" />
      </div>

      {/* Earnings table */}
      <TableCard title={`Driver earnings — ${MONTH_LABEL}`}>
        {loading ? (
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Spinner size={24} />
          </div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: 'var(--red)' }}>{error}</div>
        ) : earnings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No earnings recorded this month.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Tasks</th>
                <th>Gross Earnings</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((r) => {
                const ac = avatarColour(r.id);
                const av = AVATAR_STYLES[ac] ?? AVATAR_STYLES.blue;
                const initials = r.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
                return (
                  <tr key={r.id}>
                    <td>
                      <div className={styles.driverCell}>
                        <div className={styles.avatar} style={{ background: av.background, color: av.color, borderColor: av.border }}>
                          {initials}
                        </div>
                        <span className={styles.driverName}>{r.name}</span>
                      </div>
                    </td>
                    <td>{r.taskCount}</td>
                    <td><strong className={styles.earning}>{formatCurrency(r.gross)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableCard>
    </PageShell>
  );
}