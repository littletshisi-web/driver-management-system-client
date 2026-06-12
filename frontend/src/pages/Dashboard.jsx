import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import PageShell from '../components/layout/PageShell.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import BarChart from '../components/dashboard/BarChart.jsx';
import DonutChart from '../components/dashboard/DonutChart.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import styles from './Dashboard.module.css';

// ─── Static mock data ──────────────────────────────────────────────────────────
// TODO: Replace with real API calls:
//   Stats     → GET /api/drivers (total count), GET /api/tasks, GET /api/reports/earnings
//   Bar chart → GET /api/reports/tasks?groupBy=day&last=7
//   Donut     → GET /api/tasks?groupBy=category
//   Activity  → GET /api/audit?limit=5

const BAR_DATA = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 19 },
  { label: 'Wed', value: 8  },
  { label: 'Thu', value: 24 },
  { label: 'Fri', value: 17 },
  { label: 'Sat', value: 6  },
  { label: 'Sun', value: 11 },
];

const DONUT_DATA = [
  { label: 'Parcel Delivery',  value: 48, colour: '#1e3a5f' },
  { label: 'Vehicle Towing',   value: 28, colour: '#4a2080' },
  { label: 'Furniture Moving', value: 24, colour: '#0d5c5c' },
];

const ACTIVITY_ITEMS = [
  {
    colour: 'green', timeLabel: '9:32 AM',
    message: 'Task TSK-008 created — Parcel Delivery, Sandton',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  {
    colour: 'blue', timeLabel: '9:15 AM',
    message: 'Lebo Mokoena assigned to FastMove Logistics',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  },
  {
    colour: 'amber', timeLabel: '8:50 AM',
    message: 'Pricing updated — Towing base fee changed to R680',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    colour: 'teal', timeLabel: 'Yesterday',
    message: 'Task TSK-006 marked Completed by Lebo Mokoena',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>,
  },
  {
    colour: 'red', timeLabel: 'Yesterday',
    message: 'Task TSK-007 cancelled',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  },
];

// ─── Role-specific stat configs ────────────────────────────────────────────────
const STAT_CONFIGS = {
  [ROLES.ADMIN]: [
    { label: 'Total Drivers',  value: '24',       sub: '19 active · 5 inactive', colour: 'blue'  },
    { label: 'Active Tasks',   value: '31',       sub: '7 pending assignment',   colour: 'green' },
    { label: 'Partners',       value: '3',        sub: 'All active',             colour: 'amber' },
    { label: 'Monthly Revenue',value: 'R 84,320', sub: '↑ 12% vs last month',   colour: 'purple'},
  ],
  [ROLES.PARTNER]: [
    { label: 'My Drivers',   value: '8',       sub: '6 active · 2 busy',  colour: 'blue'  },
    { label: 'Active Tasks', value: '14',      sub: '5 in progress',       colour: 'green' },
    { label: 'This Month',   value: 'R 28,450',sub: 'After commission',    colour: 'amber' },
  ],
  [ROLES.DRIVER]: [
    { label: 'Tasks Today',    value: '3',       sub: '2 completed · 1 in progress', colour: 'blue'  },
    { label: 'Earnings Today', value: 'R 1,240', sub: '1 task pending',              colour: 'green' },
    { label: 'Monthly Total',  value: 'R 12,450',sub: '34 tasks completed',          colour: 'amber' },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const stats = STAT_CONFIGS[user?.role] ?? [];

  return (
    <PageShell
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name ?? ''}. Here's what's happening today.`}
    >
      {/* Stat cards */}
      <div className={styles.statGrid}>
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} sub={s.sub} colour={s.colour} />
        ))}
      </div>

      {/* Charts — only show the full breakdown to admin and partner */}
      {user?.role !== ROLES.DRIVER && (
        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Task completions — last 7 days</h3>
            <BarChart data={BAR_DATA} accentIndex={3} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Tasks by category</h3>
            <DonutChart segments={DONUT_DATA} />
          </div>
        </div>
      )}

      {/* Activity feed */}
      <TableCard title="Recent activity">
        <ActivityFeed items={ACTIVITY_ITEMS} />
      </TableCard>
    </PageShell>
  );
}
