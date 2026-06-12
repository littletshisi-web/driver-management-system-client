import { useState, useEffect, useCallback } from 'react';
import { getAreas } from '../api/areaApi.js';
import { MOCK_AREAS } from '../api/mockData.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useAreas() {
  const [areas, setAreas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        setAreas(MOCK_AREAS);
      } else {
        const res = await getAreas();
        setAreas(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load areas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { areas, loading, error, refetch: fetch };
}
