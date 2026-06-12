import { useState, useEffect, useCallback } from 'react';
import { getTasks } from '../api/taskApi.js';
import { MOCK_TASKS } from '../api/mockData.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useTasks(filters = {}) {
  const [tasks, setTasks]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        let data = [...MOCK_TASKS];
        if (filters.status)   data = data.filter(t => t.status === filters.status);
        if (filters.driverId) data = data.filter(t => t.driver?.id === Number(filters.driverId));
        if (filters.partnerId) {
          // For mock, we don't have partnerId on tasks, skip filter
        }
        setTasks(data);
        setTotal(data.length);
      } else {
        const res = await getTasks(filters);
        setTasks(res.data.data);
        setTotal(res.data.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { tasks, total, loading, error, refetch: fetch };
}
