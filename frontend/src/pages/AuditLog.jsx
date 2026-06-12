import { useState, useEffect } from 'react';
import api from '../api/axiosInstance.js';
import { MOCK_AUDIT } from '../api/mockData.js';
import { API } from '../constants/apiRoutes.js';
import { formatDate } from '../utils/formatDate.js';
import PageShell from '../components/layout/PageShell.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import Badge from '../components/common/Badge.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';
import styles from './AuditLog.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Maps action strings from the API to badge colours
const ACTION_COLOUR = {
  driver_assigned:     'blue',
  task_created:        'green',
  pricing_updated:     'amber',
  task_status_changed: 'teal',
  driver_suspended:    'red',
  partner_created:     'purple',
  login:               'gray',
};

export default function AuditLog() {
  const [log, setLog]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchLog = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        setLog(MOCK_AUDIT);
      } else {
        // GET /api/audit?limit=50&page=1
        const res = await api.get(API.AUDIT, { params: { limit: 50, page: 1 } });
        setLog(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLog(); }, []);

  return (
    <PageShell
      title="Audit Log"
      subtitle="System activity and sensitive action tracking — retained for 12 months"
    >
      {error && <ErrorBanner message={error} onRetry={fetchLog} />}

      <TableCard title="System events">
        {loading ? (
          <div className={styles.loadingWrap}><Spinner size={22} /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.timestamp}>
                    {/* In mock data ts is a plain string; in live data use formatDate(entry.createdAt) */}
                    {entry.ts ?? formatDate(entry.createdAt)}
                  </td>
                  <td className={styles.user}>{entry.user}</td>
                  <td>
                    <Badge colour={ACTION_COLOUR[entry.action] ?? 'gray'}>
                      {entry.action.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className={styles.entity}>{entry.entity}</td>
                  <td className={styles.detail}>{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </PageShell>
  );
}
