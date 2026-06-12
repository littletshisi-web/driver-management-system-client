import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { usePricing } from '../hooks/usePricing.js';
import { updatePricingRules } from '../api/pricingApi.js';
import { TASK_CATEGORIES } from '../constants/taskCategories.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import PageShell from '../components/layout/PageShell.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Spinner from '../components/common/Spinner.jsx';
import styles from './Pricing.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const AREA_MODIFIERS = [
  { label: 'Standard (×1.0)', value: 1.0 },
  { label: 'Extended (×1.2)', value: 1.2 },
  { label: 'Remote (×1.5)',   value: 1.5 },
];

export default function Pricing() {
  const toast = useToast();
  const { rules, loading, error, refetch, estimatePrice } = usePricing();

  const [saving, setSaving] = useState(false);

  // Editable pricing rules form — uses value + onChange so React controls the inputs
  const [formRules, setFormRules] = useState({
    baseFees: {},
    ratesPerKm: {},
    categoryModifiers: {},
    defaultCommissionPct: 12,
    premiumCommissionPct: 8,
    newPartnerCommissionPct: 15,
  });

  // Sync from loaded rules
  useEffect(() => {
    if (rules) {
      setFormRules({
        baseFees: { ...rules.baseFees },
        ratesPerKm: { ...rules.ratesPerKm },
        categoryModifiers: { ...rules.categoryModifiers },
        defaultCommissionPct: rules.defaultCommissionPct ?? 12,
        premiumCommissionPct: rules.premiumCommissionPct ?? 8,
        newPartnerCommissionPct: rules.newPartnerCommissionPct ?? 15,
      });
    }
  }, [rules]);

  const updateRule = (section, key) => (e) => {
    setFormRules((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: parseFloat(e.target.value) || 0 },
    }));
  };

  const updateSimpleRule = (key) => (e) => {
    setFormRules((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
  };

  // Calculator state
  const [calcCategory, setCalcCategory] = useState('parcel_delivery');
  const [calcDistance, setCalcDistance] = useState(15);
  const [calcAreaMod,  setCalcAreaMod]  = useState(1.0);
  const [calcResult,   setCalcResult]   = useState(0);

  useEffect(() => {
    setCalcResult(estimatePrice(calcCategory, Number(calcDistance), Number(calcAreaMod)));
  }, [calcCategory, calcDistance, calcAreaMod, estimatePrice]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!USE_MOCK) {
        await updatePricingRules(formRules);
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
      toast('Pricing rules saved successfully');
    } catch {
      toast('Failed to save pricing rules', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageShell title="Pricing"><div className={styles.center}><Spinner size={28} /></div></PageShell>;

  return (
    <PageShell
      title="Pricing Configuration"
      subtitle="Set base fees, distance rates, category modifiers, and commission percentages"
      actions={<Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>}
    >
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className={styles.grid}>
        {/* Base fees */}
        <div className={styles.card}>
          <h4 className={styles.cardTitle}>Base Service Fees</h4>
          {TASK_CATEGORIES.map((cat) => (
            <div key={cat.value} className={styles.row}>
              <label className={styles.rowLabel}>{cat.label}</label>
              <input
                type="number"
                className={styles.ruleInput}
                value={formRules.baseFees[cat.value] ?? 0}
                onChange={updateRule('baseFees', cat.value)}
              />
            </div>
          ))}
        </div>

        {/* Distance rates */}
        <div className={styles.card}>
          <h4 className={styles.cardTitle}>Distance Rates (per km)</h4>
          {TASK_CATEGORIES.map((cat) => (
            <div key={cat.value} className={styles.row}>
              <label className={styles.rowLabel}>{cat.label}</label>
              <input
                type="number"
                step="0.5"
                className={styles.ruleInput}
                value={formRules.ratesPerKm[cat.value] ?? 0}
                onChange={updateRule('ratesPerKm', cat.value)}
              />
            </div>
          ))}
        </div>

        {/* Category modifiers */}
        <div className={styles.card}>
          <h4 className={styles.cardTitle}>Category Modifiers</h4>
          {TASK_CATEGORIES.map((cat) => (
            <div key={cat.value} className={styles.row}>
              <label className={styles.rowLabel}>{cat.label}</label>
              <input
                type="number"
                step="0.1"
                className={styles.ruleInput}
                value={formRules.categoryModifiers[cat.value] ?? 1}
                onChange={updateRule('categoryModifiers', cat.value)}
              />
            </div>
          ))}
        </div>

        {/* Commissions */}
        <div className={styles.card}>
          <h4 className={styles.cardTitle}>Partner Commissions</h4>
          <div className={styles.row}>
            <label className={styles.rowLabel}>Default commission %</label>
            <input type="number" className={styles.ruleInput} value={formRules.defaultCommissionPct} onChange={updateSimpleRule('defaultCommissionPct')} />
          </div>
          <div className={styles.row}>
            <label className={styles.rowLabel}>Premium partner %</label>
            <input type="number" className={styles.ruleInput} value={formRules.premiumCommissionPct} onChange={updateSimpleRule('premiumCommissionPct')} />
          </div>
          <div className={styles.row}>
            <label className={styles.rowLabel}>New partner %</label>
            <input type="number" className={styles.ruleInput} value={formRules.newPartnerCommissionPct} onChange={updateSimpleRule('newPartnerCommissionPct')} />
          </div>
        </div>
      </div>

      {/* Live price calculator */}
      <div className={styles.calculatorCard}>
        <h4 className={styles.cardTitle}>
          Live Price Calculator
          <span className={styles.apiTag}>POST /api/pricing/calculate</span>
        </h4>

        <div className={styles.calcGrid}>
          <div className={styles.calcGroup}>
            <label className={styles.calcLabel}>Category</label>
            <select className={styles.calcSelect} value={calcCategory} onChange={(e) => setCalcCategory(e.target.value)}>
              {TASK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className={styles.calcGroup}>
            <label className={styles.calcLabel}>Distance (km)</label>
            <input
              type="number"
              className={styles.calcInput}
              value={calcDistance}
              min={1}
              onChange={(e) => setCalcDistance(e.target.value)}
            />
          </div>

          <div className={styles.calcGroup}>
            <label className={styles.calcLabel}>Area modifier</label>
            <select className={styles.calcSelect} value={calcAreaMod} onChange={(e) => setCalcAreaMod(e.target.value)}>
              {AREA_MODIFIERS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className={styles.calcResultBox}>
            <div className={styles.calcResultLabel}>Estimated Total</div>
            <div className={styles.calcResultVal}>{formatCurrency(calcResult)}</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
