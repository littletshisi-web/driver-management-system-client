import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { register as apiRegister } from '../api/authApi.js';
import { verifyApplicationToken } from '../api/applicationApi.js';
import styles from './Register.module.css';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const APPLICANT_TYPE_LABEL = {
  driver_no_vehicle:   'Driver',
  driver_with_vehicle: 'Driver',
  partner:             'Partner',
};

// Hoisted to module scope deliberately — defining this inside Register()
// would give it a new component identity on every render (i.e. on every
// keystroke in any field), causing React to unmount and remount the whole
// form each time. That silently drops input focus on every keystroke; it
// usually resolves fast enough to look fine, but desyncs visibly when
// something else (like the browser's password-autofill bar) interrupts
// the timing — seen as the keyboard dismissing and the page jumping back
// to the top mid-type.
const Shell = ({ children }) => (
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
        <h2>Join the fleet.</h2>
        <p>Set up your account to start managing driver operations, task assignment, and reporting — built for logistics teams that move fast.</p>
      </div>
    </div>

    {/* Right panel — form */}
    <div className={styles.right}>
      <div className={styles.formWrap}>{children}</div>
    </div>
  </div>
);

export default function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // ── Token verification — gates the whole page ────────────────────────────
  const [checking, setChecking]     = useState(true);
  const [application, setApplication] = useState(null);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    verifyApplicationToken(token)
      .then((res) => setApplication(res.data.data))
      .catch((err) => setTokenError(err.response?.data?.message || 'This registration link is invalid.'))
      .finally(() => setChecking(false));
  }, [token]);

  // ── Account setup form (only reachable once the token checks out) ────────
  const [name, setName]             = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (application) setName(`${application.firstName} ${application.lastName}`.trim());
  }, [application]);

  const handleRegister = async () => {
    if (!name.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiRegister(name, password, token);
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  if (registered) {
    return (
      <Shell>
        <h1 className={styles.heading}>Check your email</h1>
        <p className={styles.subheading}>
          We sent a verification link to <strong>{application?.email}</strong>. Click it to activate your account, then come back and log in.
        </p>
        <Link to="/login" className={styles.mockNotice}>Back to login</Link>
      </Shell>
    );
  }

  if (checking) {
    return (
      <Shell>
        <h1 className={styles.heading}>Checking your link…</h1>
      </Shell>
    );
  }

  // No token, or the token didn't check out — registration is closed to the public.
  if (!token || tokenError) {
    return (
      <Shell>
        <h1 className={styles.heading}>Registration is by invitation</h1>
        <p className={styles.subheading}>
          {tokenError || "You'll need an approved driver or partner application to create an account."}
        </p>
        <Link to="/apply" className={styles.loginBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', lineHeight: '20px' }}>
          Apply now
        </Link>
        <div className={styles.mockNotice}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className={styles.heading}>Set up your account</h1>
      <p className={styles.subheading}>
        Your {APPLICANT_TYPE_LABEL[application.applicantType] || 'application'} application was approved — choose a password to finish.
      </p>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.field}>
        <label className={styles.label}>Full name</label>
        <input
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="name"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email address</label>
        <input
          type="email"
          className={styles.input}
          value={application.email}
          disabled
          style={{ opacity: 0.65, cursor: 'not-allowed' }}
        />
        <span className={styles.hint}>Locked to the email on your approved application.</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="new-password"
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#94a3b8',
              fontSize: '0.8rem',
              userSelect: 'none',
            }}
            tabIndex={-1}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <span className={styles.hint}>
          8+ characters, with uppercase, lowercase, a number, and a symbol.
        </span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Confirm password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="new-password"
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#94a3b8',
              fontSize: '0.8rem',
              userSelect: 'none',
            }}
            tabIndex={-1}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <button
        className={styles.loginBtn}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <div className={styles.mockNotice}>
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </Shell>
  );
}
