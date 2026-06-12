import { useState } from 'react';
import FormField from './FormField.jsx';
import styles from './Form.module.css';
import { validatePartner, isValid } from '../../utils/validation.js';

const REGIONS = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];

/**
 * Props:
 *   initial   object   — pre-filled values for edit mode
 *   onSubmit  function — called with validated form data
 *   loading   boolean
 */
export default function PartnerForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    name:          initial.name          ?? '',
    contactName:   initial.contactName   ?? '',
    email:         initial.email         ?? '',
    phone:         initial.phone         ?? '',
    commissionPct: initial.commissionPct ?? 12,
    region:        initial.region        ?? 'Gauteng',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    const errs = validatePartner(form);
    if (!isValid(errs)) { setErrors(errs); return; }
    setErrors({});
    onSubmit(form);
  };

  return (
    <div>
      <div className={styles.row}>
        <FormField label="Company Name" error={errors.name} required>
          <input type="text" placeholder="e.g. FastMove Logistics" value={form.name} onChange={set('name')} />
        </FormField>
        <FormField label="Contact Person" error={errors.contactName} required>
          <input type="text" placeholder="e.g. Jane Doe" value={form.contactName} onChange={set('contactName')} />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Email Address" error={errors.email} required>
          <input type="email" placeholder="contact@company.co.za" value={form.email} onChange={set('email')} />
        </FormField>
        <FormField label="Phone Number" error={errors.phone} required>
          <input type="tel" placeholder="+27 11 000 0000" value={form.phone} onChange={set('phone')} />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Commission %" error={errors.commissionPct} required>
          <input type="number" min={0} max={100} value={form.commissionPct} onChange={set('commissionPct')} />
        </FormField>
        <FormField label="Region">
          <select value={form.region} onChange={set('region')}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </FormField>
      </div>

      <div className={styles.formActions}>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving…' : (initial.id ? 'Update Partner' : 'Create Partner')}
        </button>
      </div>
    </div>
  );
}
