import { useState } from 'react';
import FormField from './FormField.jsx';
import styles from './Form.module.css';
import { validateTask, isValid } from '../../utils/validation.js';
import { TASK_CATEGORIES } from '../../constants/taskCategories.js';

export default function TaskForm({ drivers = [], areas = [], onSubmit, loading }) {
  const [form, setForm] = useState({
    category:       '',
    driverId:       '',
    areaId:         '',
    distanceKm:     '',
    pickupAddress:  '',
    dropoffAddress: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    const errs = validateTask({ ...form, distanceKm: Number(form.distanceKm) });
    if (!isValid(errs)) { setErrors(errs); return; }
    setErrors({});
    onSubmit({ ...form, distanceKm: Number(form.distanceKm) });
  };

  return (
    <div>
      <div className={styles.row}>
        <FormField label="Service Category" error={errors.category} required>
          <select value={form.category} onChange={set('category')}>
            <option value="">Select category…</option>
            {TASK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Assign Driver" error={errors.driverId}>
          <select value={form.driverId} onChange={set('driverId')}>
            <option value="">Select driver…</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {`${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || 'Unknown'}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Pickup Area" error={errors.areaId}>
          <select value={form.areaId} onChange={set('areaId')}>
            <option value="">Select area…</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </FormField>
        <FormField label="Distance (km)" error={errors.distanceKm} required>
          <input type="number" min={1} placeholder="e.g. 15" value={form.distanceKm} onChange={set('distanceKm')} />
        </FormField>
      </div>

      <div className={styles.singleField}>
        <FormField label="Pickup Address" error={errors.pickupAddress} required>
          <input type="text" placeholder="Full pickup address" value={form.pickupAddress} onChange={set('pickupAddress')} />
        </FormField>
      </div>

      <div className={styles.singleField}>
        <FormField label="Drop-off Address" error={errors.dropoffAddress} required>
          <input type="text" placeholder="Full delivery address" value={form.dropoffAddress} onChange={set('dropoffAddress')} />
        </FormField>
      </div>

      <div className={styles.formActions}>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating…' : 'Create Task'}
        </button>
      </div>
    </div>
  );
}