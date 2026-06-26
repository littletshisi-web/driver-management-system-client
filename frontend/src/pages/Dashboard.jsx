import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import { getTaskReport, getEarningsReport } from '../api/reportApi.js';
import api from '../api/axiosInstance.js';
import PageShell from '../components/layout/PageShell.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import BarChart from '../components/dashboard/BarChart.jsx';
import DonutChart from '../components/dashboard/DonutChart.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import styles from './Dashboard.module.css';

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

// Map audit log actions to icon colours and SVG icons
const ACTION_ICON = {
  CREATE: {
    colour: 'green',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  UPDATE: {
    colour: 'amber',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  UPDATE_STATUS: {
    colour: 'blue',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>,
  },
  DELETE: {
    colour: 'red',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  },
  ASSIGN: {
    colour: 'blue',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  },
  SUSPEND: {
    colour: 'red',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  },
};

const defaultIcon = {
  colour: 'gray',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/></svg>,
};

function formatTimeLabel(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs < 24) return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  if (diffHrs < 48) return 'Yesterday';
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]         = useState([]);
  const [barData, setBarData]     = useState([]);
  const [donutData, setDonutData] = useState([]);
  const [activity, setActivity]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!user?.role) return;

    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        if (user.role === ROLES.DRIVER) {
          const today = todayRange();
          const month = monthRange();

          const [taskRes, todayEarningsRes, monthEarningsRes] = await Promise.all([
            getTaskReport({ from: today.from, to: today.to }),
            getEarningsReport({ from: today.from, to: today.to }),
            getEarningsReport({ from: month.from, to: month.to }),
          ]);

          const taskSummary = taskRes.data.summary;
          const todayGross  = todayEarningsRes.data.totals?.gross ?? 0;
          const monthGross  = monthEarningsRes.data.totals?.gross ?? 0;
          const monthTaskCount = monthEarningsRes.data.data?.length ?? 0;

          setStats([
            { label: 'Tasks Today',    value: String(taskSummary.total),           sub: `${taskSummary.completed} completed · ${taskSummary.inProgress} in progress`, colour: 'blue'  },
            { label: 'Earnings Today', value: `R ${todayGross.toLocaleString()}`,  sub: `${taskSummary.total - taskSummary.completed - taskSummary.cancelled} pending`, colour: 'green' },
            { label: 'Monthly Total',  value: `R ${monthGross.toLocaleString()}`,  sub: `${monthTaskCount} tasks completed`, colour: 'amber' },
          ]);
        } else {
          const month = monthRange();

          const [driversRes, tasksRes, partnersRes, revenueRes] = await Promise.all([
            api.get('/drivers/stats'),
            api.get('/tasks/stats'),
            api.get('/partners/stats'),
            api.get(`/reports/revenue-summary?from=${month.from}&to=${month.to}`),
          ]);

          const drivers  = driversRes.data;
          const tasks    = tasksRes.data;
          const partners = partnersRes.data;
          const revenue  = revenueRes.data;

          if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER) {
            setStats([
              { label: 'Total Drivers',   value: String(drivers.data?.total ?? '—'),                        sub: `${drivers.data?.active ?? 0} active`,   colour: 'blue'   },
              { label: 'Active Tasks',    value: String(tasks.data?.active ?? '—'),                         sub: `${tasks.data?.pending ?? 0} pending`,   colour: 'green'  },
              { label: 'Partners',        value: String(partners.data?.total ?? '—'),                       sub: `${partners.data?.active ?? 0} active`,  colour: 'amber'  },
              { label: 'Monthly Revenue', value: `R ${(revenue.data?.gross ?? 0).toLocaleString()}`,        sub: 'This month',                            colour: 'purple' },
            ]);
          } else {
            setStats([
              { label: 'My Drivers',  value: String(drivers.data?.total ?? '—'),                  sub: `${drivers.data?.active ?? 0} active`,  colour: 'blue'  },
              { label: 'Active Tasks',value: String(tasks.data?.active ?? '—'),                   sub: `${tasks.data?.pending ?? 0} pending`,  colour: 'green' },
              { label: 'This Month',  value: `R ${(revenue.data?.gross ?? 0).toLocaleString()}`,  sub: 'Revenue',                              colour: 'amber' },
            ]);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard data.');
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    const loadCharts = async () => {
      try {
        const [barRes, donutRes, auditRes] = await Promise.all([
          api.get('/reports/tasks-by-day?last=7'),
          api.get('/tasks/stats-by-category'),
          api.get('/audit?limit=5'),
        ]);

        setBarData(barRes.data.data ?? []);
        setDonutData(donutRes.data.data ?? []);

        const auditRows = auditRes.data.data ?? [];
        setActivity(auditRows.map((entry) => {
          const { colour, icon } = ACTION_ICON[entry.action] ?? defaultIcon;
          return {
            colour,
            icon,
            timeLabel: formatTimeLabel(entry.createdAt),
            message: `${entry.action} on ${entry.entity}${entry.entityId ? ` (${String(entry.entityId).slice(0, 8)}…)` : ''}`,
          };
        }));
      } catch {
        // Charts are non-critical — fail silently
      }
    };

    loadStats();
    if (user.role !== ROLES.DRIVER) loadCharts();
  }, [user?.role]);

  return (
    <PageShell
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name ?? ''}. Here's what's happening today.`}
    >
      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Stat cards */}
      <div className={styles.statGrid}>
        {loading
          ? <div className={styles.loadingMsg}>Loading your stats…</div>
          : stats.map((s, i) => (
              <StatCard key={i} label={s.label} value={s.value} sub={s.sub} colour={s.colour} />
            ))
        }
      </div>

      {/* Charts — admin and partner only */}
      {user?.role !== ROLES.DRIVER && (
        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Task completions — last 7 days</h3>
            <BarChart data={barData.length > 0 ? barData : []} accentIndex={barData.reduce((maxI, d, i, arr) => d.value > arr[maxI].value ? i : maxI, 0)} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Tasks by category</h3>
            <DonutChart segments={donutData.length > 0 ? donutData : []} />
          </div>
        </div>
      )}

      {/* Activity feed */}
      {user?.role !== ROLES.DRIVER && (
        <TableCard title="Recent activity">
          {activity.length > 0
            ? <ActivityFeed items={activity} />
            : <div style={{ padding: '1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>No recent activity.</div>
          }
        </TableCard>
      )}
    </PageShell>
  );
}