import { useState, useEffect, useCallback } from 'react';
import { getPartners } from '../api/partnerApi.js';
import { MOCK_PARTNERS } from '../api/mockData.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function usePartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        setPartners(MOCK_PARTNERS);
      } else {
        const res = await getPartners();
        setPartners(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { partners, loading, error, refetch: fetch };
}
