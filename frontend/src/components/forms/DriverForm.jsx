import { useState } from 'react';
import FormField from './FormField.jsx';
import styles from './Form.module.css';
import { validateDriver, isValid } from '../../utils/validation.js';

const VEHICLE_TYPES = ['Sedan', 'Van', 'Bakkie', 'Truck', 'Tow Truck'];
const STATUSES      = [
  { value: 'available', label: 'Available' },
  { value: 'busy',      label: 'Busy'      },
  { value: 'inactive',  label: 'Inactive'  },
];

/**
 * Props:
 *   initial   object   — pre-filled values for edit mode (optional)
 *   areas     Area[]   — from useAreas() hook
 *   partners  Partner[]— from usePartners() hook
 *   onSubmit  function — called with form data object when valid
 *   loading   boolean  — disables submit while API call is in flight
 */
export default function DriverForm({ initial = {}, areas = [], partners = [], onSubmit, loading }) {
  const [form, setForm] = useState({
    // Backend uses firstName+lastName; frontend mock uses single 'name'
    name:               initial.name               ?? '',
    firstName:          initial.firstName           ?? '',
    lastName:           initial.lastName           ?? '',
    phone:              initial.phone              ?? '',
    licenseNumber:      initial.licenseNumber      ?? '',
    vehicleType:        initial.vehicleType        ?? '',
    vehicleReg:         initial.vehicleReg         ?? '',
    areaId:             initial.area?.id            ?? '',
    partnerId:          initial.partner?.id         ?? '',
    availabilityStatus: initial.availabilityStatus ?? 'available',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    const errs = validateDriver(form);
    if (!isValid(errs)) { setErrors(errs); return; }
    setErrors({});
    onSubmit(form);
  };

  return (
    <div>
      <div className={styles.row}>
        <FormField label="Full Name" error={errors.name} required>
          <input type="text" placeholder="e.g. John Smith" value={form.name} onChange={set('name')} />
        </FormField>
        <FormField label="Phone" error={errors.phone} required>
          <input type="tel" placeholder="+27 82 000 0000" value={form.phone} onChange={set('phone')} />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="License Number" error={errors.licenseNumber} required>
          <input type="text" placeholder="e.g. GP12345678" value={form.licenseNumber} onChange={set('licenseNumber')} />
        </FormField>
        <FormField label="Vehicle Type" error={errors.vehicleType} required>
          <select value={form.vehicleType} onChange={set('vehicleType')}>
            <option value="">Select type…</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Vehicle Registration" error={errors.vehicleReg} required>
          <input type="text" placeholder="e.g. GP 123-456" value={form.vehicleReg} onChange={set('vehicleReg')} />
        </FormField>
        <FormField label="Operational Area">
          {/* Populated from GET /api/areas via useAreas() hook in parent */}
          <select value={form.areaId} onChange={set('areaId')}>
            <option value="">Select area…</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
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
        <FormField label="Availability Status">
          <select value={form.availabilityStatus} onChange={set('availabilityStatus')}>
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
