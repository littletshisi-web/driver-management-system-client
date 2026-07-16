import { useState } from 'react';
import FormField from './FormField.jsx';
import styles from './Form.module.css';
import { validateDriver, isValid } from '../../utils/validation.js';

const STATUSES = [
  { value: 'active',    label: 'Active'    },
  { value: 'inactive',  label: 'Inactive'  },
  { value: 'on-leave',  label: 'On Leave'  },
  { value: 'suspended', label: 'Suspended' },
];

/**
 * Props:
 *   initial   object   — pre-filled Driver record for edit mode (optional)
 *   areas     Area[]   — from useAreas() hook
 *   partners  Partner[]— from usePartners() hook
 *   onSubmit  function — called with form data object when valid
 *   loading   boolean  — disables submit while API call is in flight
 */
export default function DriverForm({ initial = {}, areas = [], partners = [], onSubmit, loading }) {
  const [form, setForm] = useState({
    // Driver model has firstName+lastName (no combined `name` field)
    firstName:      initial.firstName      ?? '',
    lastName:       initial.lastName       ?? '',
    phone:          initial.phone          ?? '',
    licenceNumber:  initial.licenceNumber  ?? '',
    vehicleReg:     initial.vehicleReg     ?? '',
    // Driver.zone is a plain string column, not a foreign key — store the area name
    zone:           initial.zone           ?? '',
    partnerId:      initial.partnerId      ?? initial.partner?.id ?? '',
    status:         initial.status         ?? 'active',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    const errs = validateDriver(form);
    if (!isValid(errs)) { setErrors(errs); return; }
    setErrors({});
    // Don't send empty optional fields — backend Joi schema rejects empty
    // strings for these (no .allow('')), and partnerId needs a real UUID
    // or the field omitted entirely.
    const payload = { ...form };
    ['partnerId', 'licenceNumber', 'vehicleReg', 'zone'].forEach((key) => {
      if (!payload[key]) delete payload[key];
    });
    onSubmit(payload);
  };

  return (
    <div>
      <div className={styles.row}>
        <FormField label="First Name" error={errors.firstName} required>
          <input type="text" placeholder="e.g. John" value={form.firstName} onChange={set('firstName')} />
        </FormField>
        <FormField label="Last Name" error={errors.lastName} required>
          <input type="text" placeholder="e.g. Smith" value={form.lastName} onChange={set('lastName')} />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Phone" error={errors.phone} required>
          <input type="tel" placeholder="+27 82 000 0000" value={form.phone} onChange={set('phone')} />
        </FormField>
        <FormField label="Licence Number" error={errors.licenceNumber}>
          <input type="text" placeholder="e.g. GP12345678" value={form.licenceNumber} onChange={set('licenceNumber')} />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Vehicle Registration" error={errors.vehicleReg}>
          <input type="text" placeholder="e.g. GP 123-456" value={form.vehicleReg} onChange={set('vehicleReg')} />
        </FormField>
        <FormField label="Operational Area">
          {/* Driver.zone stores the area name as plain text */}
          <select value={form.zone} onChange={set('zone')}>
            <option value="">Select area…</option>
            {areas.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Assign to Partner">
          {/* Populated from GET /api/partners via usePartners() hook in parent */}
          <select value={form.partnerId} onChange={set('partnerId')}>
            <option value="">No partner (unpartnered)</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </FormField>
      </div>

      <div className={styles.formActions}>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving…' : (initial.id ? 'Update Driver' : 'Create Driver')}
        </button>
      </div>
    </div>
  );
}