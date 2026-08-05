import { useState, useEffect, useCallback } from 'react';
import { getApplications } from '../api/applicationApi.js';

export function useApplications(status) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApplications(status ? { status } : {});
      setApplications(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { applications, loading, error, refetch: fetch };
}
