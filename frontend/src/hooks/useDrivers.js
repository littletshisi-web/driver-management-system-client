import { useState, useEffect, useCallback } from 'react';
import { getDrivers } from '../api/driverApi.js';
import { MOCK_DRIVERS } from '../api/mockData.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Fetches the driver list with optional filtering.
 * Pass filters as an object: { search, status, partnerId, page, limit }
 */
export function useDrivers(filters = {}) {
  const [drivers, setDrivers] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        // Apply mock filtering client-side
        let data = [...MOCK_DRIVERS];
        if (filters.search) {
          const q = filters.search.toLowerCase();
          data = data.filter(d => d.name.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q));
        }
        if (filters.status) {
          data = data.filter(d => d.availabilityStatus === filters.status);
        }
        if (filters.partnerId) {
          data = data.filter(d => d.partner?.id === Number(filters.partnerId));
        }
        setDrivers(data.filter(Boolean));
        setTotal(data.length);
      } else {
        const res = await getDrivers(filters);
        setDrivers((res.data.data ?? []).filter(Boolean));
        setTotal(res.data.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { drivers, total, loading, error, refetch: fetch };
}