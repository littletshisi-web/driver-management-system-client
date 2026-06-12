import { useState, useEffect, useCallback } from 'react';
import { getPricingRules } from '../api/pricingApi.js';
import { MOCK_PRICING } from '../api/mockData.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function usePricing() {
  const [rules, setRules]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        setRules(MOCK_PRICING);
      } else {
        const res = await getPricingRules();
        setRules(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  /**
   * Client-side price estimation. Used in the calculator before the backend is wired.
   * Once backend is ready, replace this with a POST /api/pricing/calculate call.
   */
  const estimatePrice = useCallback((category, distanceKm, areaModifier = 1.0) => {
    if (!rules) return 0;
    const base = rules.baseFees[category] || 0;
    const rate = rules.ratesPerKm[category] || 0;
    const mod  = rules.categoryModifiers[category] || 1;
    return (base + distanceKm * rate) * areaModifier * mod;
  }, [rules]);

  return { rules, loading, error, refetch: fetch, estimatePrice };
}
