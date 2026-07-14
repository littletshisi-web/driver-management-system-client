import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register as apiRegister } from '../api/authApi.js';
import { ROLES } from '../constants/roles.js';
import styles from './Register.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const SELECTABLE_ROLES = [ROLES.DRIVER, ROLES.PARTNER];

export default function Register() {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]             = useState(ROLES.DRIVER);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
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
      await apiRegister(name, email, password, role);
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
      <div className={styles.page}>
        <div className={styles.right} style={{ width: '100%' }}>
          <div className={styles.formWrap}>
            <h1 className={styles.heading}>Check your email</h1>
            <p className={styles.subheading}>
              We sent a verification link to <strong>{email}</strong>. Click it to activate your account, then come back and log in.
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
          <h2>Join the fleet.</h2>
          <p>Create an account to start managing driver operations, task assignment, and reporting — built for logistics teams that move fast.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <h1 className={styles.heading}>Create account</h1>
          <p className={styles.subheading}>Sign up to access your role-based dashboard</p>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
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

          <div className={styles.field}>
            <label className={styles.label}>Account type</label>
            <div className={styles.roleToggle}>
              {SELECTABLE_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.roleBtn} ${role === r ? styles.roleActive : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <span className={styles.hint}>
              Need an admin account? Ask an existing admin to upgrade your access after signing up.
            </span>
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
        </div>
      </div>
    </div>
  );
}