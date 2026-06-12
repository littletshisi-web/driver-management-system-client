import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { exportReport } from '../api/reportApi.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { ROLES } from '../constants/roles.js';
import PageShell from '../components/layout/PageShell.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import styles from './Reports.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// TODO: Replace with GET /api/reports/earnings
const MOCK_EARNINGS = [
  { id: 1, name: 'Lebo Mokoena',   initials: 'LM', tasks: 34, parcel: 18, towing: 8,  furniture: 8, total: 12450, partner: 'FastMove',  colour: 'blue'   },
  { id: 2, name: 'Thabo Nkosi',    initials: 'TN', tasks: 28, parcel: 12, towing: 10, furniture: 6, total: 10890, partner: 'FastMove',  colour: 'purple' },
  { id: 3, name: 'Priya Singh',    initials: 'PS', tasks: 22, parcel: 20, towing: 1,  furniture: 1, total: 7340,  partner: 'QuickHaul', colour: 'teal'   },
  { id: 4, name: 'Kobus Du Toit',  initials: 'KD', tasks: 19, parcel: 5,  towing: 12, furniture: 2, total: 15120, partner: null,         colour: 'amber'  },
];

const AVATAR_STYLES = {
  blue:   { background: 'var(--accent-light)', color: 'var(--accent)',  border: 'rgba(30,58,95,0.2)'  },
  purple: { background: 'var(--purple-bg)',    color: 'var(--purple)',  border: 'rgba(74,32,128,0.2)' },
  teal:   { background: 'var(--teal-bg)',      color: 'var(--teal)',    border: 'rgba(13,92,92,0.2)'  },
  amber:  { background: 'var(--amber-bg)',     color: 'var(--amber)',   border: 'rgba(138,90,0,0.2)'  },
};

export default function Reports() {
  const toast  = useToast();
  const { user } = useAuth();

  const handleExport = async (type) => {
    try {
      if (USE_MOCK) {
        toast(`Mock export: ${type.toUpperCase()} download would start here`);
        return;
      }
      const res = await exportReport(type, { from: '2025-05-01', to: '2025-05-31' });
      downloadBlob(res.data, `dms-report-${Date.now()}.${type}`);
      toast(`${type.toUpperCase()} exported successfully`);
    } catch {
      toast('Export failed — please try again', 'error');
    }
  };

  // Drivers only see their own row
  const rows = user?.role === ROLES.DRIVER
    ? MOCK_EARNINGS.filter((r) => r.id === 3) // simulate driver's own record
    : MOCK_EARNINGS;

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
        <StatCard label="Monthly Earnings" value="R 84,320"  sub="↑ 12% vs last month" colour="green"  />
        <StatCard label="Tasks Completed"  value="218"       sub="This month"           colour="blue"   />
        <StatCard label="Avg Task Value"   value="R 387"     sub="All categories"       colour="amber"  />
        <StatCard label="Active Drivers"   value="19"        sub="Of 24 registered"     colour="purple" />
      </div>

      {/* Earnings table */}
      <TableCard title="Driver earnings — May 2025">
        <table>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Total Tasks</th>
              <th>Parcel</th>
              <th>Towing</th>
              <th>Furniture</th>
              <th>Gross Earnings</th>
              <th>Partner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const av = AVATAR_STYLES[r.colour] ?? AVATAR_STYLES.blue;
              return (
                <tr key={r.id}>
                  <td>
                    <div className={styles.driverCell}>
                      <div className={styles.avatar} style={{ background: av.background, color: av.color, borderColor: av.border }}>
                        {r.initials}
                      </div>
                      <span className={styles.driverName}>{r.name}</span>
                    </div>
                  </td>
                  <td>{r.tasks}</td>
                  <td>{r.parcel}</td>
                  <td>{r.towing}</td>
                  <td>{r.furniture}</td>
                  <td><strong className={styles.earning}>{formatCurrency(r.total)}</strong></td>
                  <td>
                    {r.partner
                      ? <Badge colour="blue">{r.partner}</Badge>
                      : <Badge colour="gray">Unpartnered</Badge>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>
    </PageShell>
  );
}
