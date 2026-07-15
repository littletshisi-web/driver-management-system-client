import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { usePricing } from '../hooks/usePricing.js';
import { updatePricingRules, calculatePrice } from '../api/pricingApi.js';
import PageShell from '../components/layout/PageShell.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';

const CATEGORIES = ['Parcel Delivery', 'Vehicle Towing', 'Furniture Moving'];

// Backend PricingConfig stores category keys as snake_case slugs, not the
// human-readable labels used in the UI — map between the two here.
const CATEGORY_SLUGS = {
  'Parcel Delivery':  'parcel_delivery',
  'Vehicle Towing':   'vehicle_towing',
  'Furniture Moving': 'furniture_moving',
};
const slug = (label) => CATEGORY_SLUGS[label] || label;

const AREA_MODIFIERS = [
  { label: 'Standard (×1.0)', value: 1.0 },
  { label: 'Extended (×1.2)', value: 1.2 },
  { label: 'Remote (×1.5)',   value: 1.5 },
];

const sectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1.5rem',
  marginBottom: '1.5rem',
};

const cardStyle = {
  background: 'var(--surface, #1e293b)',
  border: '1px solid var(--border, #334155)',
  borderRadius: '10px',
  padding: '1.25rem 1.5rem',
};

const cardTitleStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted, #94a3b8)',
  marginBottom: '1rem',
};

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.65rem',
  gap: '1rem',
};

const labelStyle = {
  fontSize: '0.875rem',
  color: 'var(--text, #e2e8f0)',
  flexShrink: 0,
};

const inputStyle = {
  width: '80px',
  padding: '0.3rem 0.5rem',
  borderRadius: '6px',
  border: '1px solid var(--border, #334155)',
  background: 'var(--input-bg, #0f172a)',
  color: 'var(--text, #e2e8f0)',
  fontSize: '0.875rem',
  textAlign: 'right',
};

const calcCardStyle = {
  ...cardStyle,
  background: 'var(--surface-2, #0f172a)',
};

const estimatedStyle = {
  background: 'var(--accent, #f59e0b)',
  borderRadius: '8px',
  padding: '1rem 1.25rem',
  textAlign: 'center',
};

export default function Pricing() {
  const toast = useToast();
  const { rules, loading, error, refetch } = usePricing();

  const [saving, setSaving] = useState(false);
  const [draft, setDraft]   = useState(null);

  // Calculator state
  const [calcCategory, setCalcCategory]   = useState(CATEGORIES[0]);
  const [calcDistance, setCalcDistance]   = useState(15);
  const [calcModifier, setCalcModifier]   = useState(1.0);
  const [calcResult, setCalcResult]       = useState(null);
  const [calcLoading, setCalcLoading]     = useState(false);

  // Use draft if editing, otherwise use live rules
  const data = draft ?? rules;

  const setField = (section, key, value) => {
    const base = draft ?? rules;
    setDraft({
      ...base,
      [section]: { ...base[section], [key]: parseFloat(value) || 0 },
    });
  };

  const setTopField = (key, value) => {
    const base = draft ?? rules;
    setDraft({ ...base, [key]: parseFloat(value) || 0 });
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await updatePricingRules(draft);
      toast('Pricing rules saved');
      setDraft(null);
      refetch();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save pricing rules', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => setDraft(null);

  const handleCalculate = async () => {
    setCalcLoading(true);
    try {
      const res = await calculatePrice({
        category: slug(calcCategory),
        distanceKm: parseFloat(calcDistance) || 0,
        areaModifier: parseFloat(calcModifier) || 1.0,
      });
      setCalcResult(res.data);
    } catch {
      // Fall back to client-side estimate
      if (data) {
        const cat  = slug(calcCategory);
        const base = data.baseFees?.[cat] || 0;
        const rate = data.ratesPerKm?.[cat] || 0;
        const mod  = data.categoryModifiers?.[cat] || 1;
        const dist = parseFloat(calcDistance) || 0;
        const area = parseFloat(calcModifier) || 1.0;
        setCalcResult({ finalPrice: (base + dist * rate) * area * mod });
      }
    } finally {
      setCalcLoading(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Pricing" subtitle="Configure service rates and commission structures">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size={28} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Pricing"
      subtitle="Configure service rates and commission structures"
      actions={
        draft ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={handleDiscard} disabled={saving}>Discard</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        ) : null
      }
    >
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {data && (
        <>
          {/* Row 1: Base Fees + Distance Rates + Category Modifiers */}
          <div style={sectionStyle}>
            {/* Base Service Fees */}
            <div style={cardStyle}>
              <div style={cardTitleStyle}>Base Service Fees (R)</div>
              {CATEGORIES.map((cat) => (
                <div key={cat} style={rowStyle}>
                  <span style={labelStyle}>{cat}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    value={data.baseFees?.[slug(cat)] ?? 0}
                    onChange={(e) => setField('baseFees', slug(cat), e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Distance Rates */}
            <div style={cardStyle}>
              <div style={cardTitleStyle}>Distance Rates (R per km)</div>
              {CATEGORIES.map((cat) => (
                <div key={cat} style={rowStyle}>
                  <span style={labelStyle}>{cat}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    value={data.ratesPerKm?.[slug(cat)] ?? 0}
                    onChange={(e) => setField('ratesPerKm', slug(cat), e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Category Modifiers */}
            <div style={cardStyle}>
              <div style={cardTitleStyle}>Category Modifiers (×)</div>
              {CATEGORIES.map((cat) => (
                <div key={cat} style={rowStyle}>
                  <span style={labelStyle}>{cat}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    value={data.categoryModifiers?.[slug(cat)] ?? 1}
                    onChange={(e) => setField('categoryModifiers', slug(cat), e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Partner Commissions + Live Calculator */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Partner Commissions */}
            <div style={cardStyle}>
              <div style={cardTitleStyle}>Partner Commissions</div>
              <div style={rowStyle}>
                <span style={labelStyle}>Default commission %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  style={inputStyle}
                  value={data.defaultCommissionPct ?? 0}
                  onChange={(e) => setTopField('defaultCommissionPct', e.target.value)}
                />
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Premium partner %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  style={inputStyle}
                  value={data.premiumCommissionPct ?? 0}
                  onChange={(e) => setTopField('premiumCommissionPct', e.target.value)}
                />
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>New partner %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  style={inputStyle}
                  value={data.newPartnerCommissionPct ?? 0}
                  onChange={(e) => setTopField('newPartnerCommissionPct', e.target.value)}
                />
              </div>
            </div>

            {/* Live Price Calculator */}
            <div style={calcCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={cardTitleStyle}>Live Price Calculator</div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>
                  POST /api/pricing/calculate
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ ...cardTitleStyle, marginBottom: '0.4rem' }}>Category</div>
                  <select
                    style={{ ...inputStyle, width: '100%', textAlign: 'left' }}
                    value={calcCategory}
                    onChange={(e) => setCalcCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ ...cardTitleStyle, marginBottom: '0.4rem' }}>Distance (km)</div>
                  <input
                    type="number"
                    min="0"
                    style={{ ...inputStyle, width: '100%' }}
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(e.target.value)}
                  />
                </div>
                <div>
                  <div style={{ ...cardTitleStyle, marginBottom: '0.4rem' }}>Area Modifier</div>
                  <select
                    style={{ ...inputStyle, width: '100%', textAlign: 'left' }}
                    value={calcModifier}
                    onChange={(e) => setCalcModifier(e.target.value)}
                  >
                    {AREA_MODIFIERS.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button variant="primary" onClick={handleCalculate} disabled={calcLoading} style={{ width: '100%', marginBottom: '1rem' }}>
                {calcLoading ? 'Calculating…' : 'Calculate Price'}
              </Button>

              {calcResult && (
                <div style={estimatedStyle}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e293b', marginBottom: '0.25rem' }}>
                    Estimated Total
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
                    R {(calcResult.finalPrice ?? 0).toFixed(2)}
                  </div>
                  {calcResult.breakdown && (
                    <div style={{ fontSize: '0.75rem', color: '#374151', marginTop: '0.4rem' }}>
                      Base: R{calcResult.breakdown.baseFee?.toFixed(2)} · Distance: R{calcResult.breakdown.distanceFee?.toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}