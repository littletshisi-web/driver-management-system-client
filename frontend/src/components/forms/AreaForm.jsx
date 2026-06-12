import { useState } from 'react';
import FormField from './FormField.jsx';
import styles from './Form.module.css';
import { validateArea, isValid } from '../../utils/validation.js';

const REGIONS    = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];
const ZONE_TYPES = ['Standard', 'Extended', 'Remote'];

export default function AreaForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    name:          initial.name          ?? '',
    region:        initial.region        ?? 'Gauteng',
    priceModifier: initial.priceModifier ?? 1.0,
    zoneType:      initial.zoneType      ?? 'Standard',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    const errs = validateArea({ ...form, priceModifier: Number(form.priceModifier) });
    if (!isValid(errs)) { setErrors(errs); return; }
    setErrors({});
    onSubmit({ ...form, priceModifier: Number(form.priceModifier) });
  };

  return (
    <div>
      <div className={styles.row}>
        <FormField label="Area Name" error={errors.name} required>
          <input type="text" placeholder="e.g. Sandton North" value={form.name} onChange={set('name')} />
        </FormField>
        <FormField label="Region" error={errors.region} required>
          <select value={form.region} onChange={set('region')}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Price Modifier" error={errors.priceModifier} required>
          <input type="number" min={0.5} max={5} step={0.1} value={form.priceModifier} onChange={set('priceModifier')} />
        </FormField>
        <FormField label="Zone Type">
          <select value={form.zoneType} onChange={set('zoneType')}>
            {ZONE_TYPES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </FormField>
      </div>

      <div className={styles.formActions}>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving…' : (initial.id ? 'Update Area' : 'Add Area')}
        </button>
      </div>
    </div>
  );
}
