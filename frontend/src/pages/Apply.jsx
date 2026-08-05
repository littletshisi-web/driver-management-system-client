import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitApplication } from '../api/applicationApi.js';
import { TASK_CATEGORIES } from '../constants/taskCategories.js';
import styles from './Apply.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const APPLICANT_TYPES = [
  { value: '',                     label: '-- Select Type --' },
  { value: 'driver_no_vehicle',    label: 'Driver (No Vehicle)' },
  { value: 'driver_with_vehicle',  label: 'Driver (Own Vehicle)' },
  { value: 'partner',              label: 'Partner (Fleet Owner)' },
];

const MAX_FILE_MB = 5;

export default function Apply() {
  const [applicantType, setApplicantType] = useState('');
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [idNumber, setIdNumber]   = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [fleetSize, setFleetSize]     = useState('');
  const [serviceInterest, setServiceInterest] = useState([]);
  const [location, setLocation]   = useState('');
  const [availability, setAvailability] = useState('');

  const [idDoc, setIdDoc]           = useState(null);
  const [licenceDoc, setLicenceDoc] = useState(null);
  const [discDoc, setDiscDoc]       = useState(null);
  const [photo, setPhoto]           = useState(null);

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const hasVehicle = applicantType !== 'driver_no_vehicle';
  const isPartner  = applicantType === 'partner';

  const toggleService = (value) => {
    setServiceInterest((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const pickFile = (setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) { setter(null); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`${file.name} is larger than ${MAX_FILE_MB}MB.`);
      e.target.value = '';
      setter(null);
      return;
    }
    setter(file);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !applicantType) {
      setError('Please fill in your name, email, phone number, and select an application type.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter your location.');
      return;
    }
    if (!idDoc || !licenceDoc || !photo) {
      setError('ID copy, driver\'s license, and a profile photo are required.');
      return;
    }
    if (hasVehicle && !discDoc) {
      setError('Disc certification is required when you have a vehicle.');
      return;
    }

    setLoading(true);
    setError('');

    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    const formData = new FormData();
    formData.append('applicantType', applicantType);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email.trim());
    formData.append('phone', phone.trim());
    if (idNumber.trim()) formData.append('idNumber', idNumber.trim());
    formData.append('city', location.trim());
    if (hasVehicle && vehicleInfo.trim()) formData.append('vehicleType', vehicleInfo.trim());
    if (isPartner && fleetSize) formData.append('fleetSize', fleetSize);
    if (availability.trim()) formData.append('notes', availability.trim());
    formData.append('serviceInterest', JSON.stringify(serviceInterest));
    formData.append('idDoc', idDoc);
    formData.append('licenceDoc', licenceDoc);
    if (discDoc) formData.append('discDoc', discDoc);
    formData.append('photo', photo);

    try {
      await submitApplication(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.right} style={{ width: '100%' }}>
          <div className={styles.formWrap}>
            <h1 className={styles.heading}>Application received</h1>
            <p className={styles.subheading}>
              Thanks, {fullName.split(' ')[0]}! We've emailed a confirmation to <strong>{email}</strong>. Our team will review your details and documents — you'll hear back within a few business days.
            </p>
            <Link to="/login" className={styles.mockNotice}>Back to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Left panel — branding */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg viewBox="0 0 24 24" fill="white" width={22} height={22}>
              <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4" stroke="white" strokeWidth="2"/>
              <line x1="10" y1="1" x2="10" y2="4" stroke="white" strokeWidth="2"/>
              <line x1="14" y1="1" x2="14" y2="4" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>DMS</div>
            <div className={styles.brandSub}>Driver Management System</div>
          </div>
        </div>

        <div className={styles.tagline}>
          <h2>Become a driver.</h2>
          <p>Own a fleet, own a vehicle, or no vehicle at all — there's a lane for you. Apply and start earning with flexible work across parcels, moving, and towing.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <h1 className={styles.heading}>Application Form</h1>
          <p className={styles.subheading}>Fields marked * are required. Upload clear docs — blurry pics may delay approval.</p>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name *</label>
              <input className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Thabo Mokoena" autoComplete="name" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number *</label>
              <input type="tel" className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0712345678" autoComplete="tel" />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <input type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. thabo@email.com" autoComplete="email" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apply As *</label>
              <select className={styles.input} value={applicantType} onChange={(e) => setApplicantType(e.target.value)}>
                {APPLICANT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>ID Number *</label>
              <input className={styles.input} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="South African ID number" />
            </div>
            {hasVehicle && (
              <div className={styles.field}>
                <label className={styles.label}>Vehicle Info</label>
                <input className={styles.input} value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} placeholder="e.g. Toyota Hilux, White, 2018, 1 Ton" />
              </div>
            )}
          </div>

          {isPartner && (
            <div className={styles.field}>
              <label className={styles.label}>Fleet size</label>
              <input type="number" min="1" className={styles.input} value={fleetSize} onChange={(e) => setFleetSize(e.target.value)} placeholder="Number of vehicles" />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Services you're interested in</label>
            <div className={styles.checkGrid}>
              {TASK_CATEGORIES.map((c) => (
                <label key={c.value} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={serviceInterest.includes(c.value)}
                    onChange={() => toggleService(c.value)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          {hasVehicle && (
            <div className={styles.field}>
              <label className={styles.label}>Upload Valid Disc Certification (PDF) *</label>
              <input type="file" className={styles.fileInput} accept=".pdf,image/*" onChange={pickFile(setDiscDoc)} />
              <span className={styles.hint}>PDF only. Max {MAX_FILE_MB}MB.</span>
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Upload ID Copy (PDF) *</label>
              <input type="file" className={styles.fileInput} accept=".pdf,image/*" onChange={pickFile(setIdDoc)} />
              <span className={styles.hint}>PDF only. Max {MAX_FILE_MB}MB.</span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Upload Driver's License *</label>
              <input type="file" className={styles.fileInput} accept=".pdf,image/*" onChange={pickFile(setLicenceDoc)} />
              <span className={styles.hint}>PDF or image. Max {MAX_FILE_MB}MB.</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Upload Your Photo *</label>
            <input type="file" className={styles.fileInput} accept="image/*" onChange={pickFile(setPhoto)} />
            <span className={styles.hint}>Clear face photo. Max {MAX_FILE_MB}MB.</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Location *</label>
            <input className={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter your address" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Availability</label>
            <input className={styles.input} value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="e.g. Weekdays after 5pm, Weekends anytime" />
          </div>

          <button className={styles.loginBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>

          <p className={styles.hint} style={{ textAlign: 'center', marginTop: 10 }}>
            By submitting, you confirm your documents are genuine.
          </p>

          <div className={styles.mockNotice}>
            Already approved? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
