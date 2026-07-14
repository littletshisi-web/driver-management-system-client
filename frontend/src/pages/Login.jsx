import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { login as apiLogin } from '../api/authApi.js';
import styles from './Login.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MOCK_USERS = {
  admin:   { id: 1, name: 'Admin User',    email: 'admin@dms.co.za',   role: 'admin'   },
  partner: { id: 2, name: 'Sarah Johnson', email: 'partner@dms.co.za', role: 'partner' },
  driver:  { id: 3, name: 'Lebo Mokoena', email: 'driver@dms.co.za',  role: 'driver'  },
};

const DEMO_EMAILS = {
  admin:   'admin@dms.co.za',
  partner: 'partner@dms.co.za',
  driver:  'driver@dms.co.za',
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole]             = useState('admin');
  const [email, setEmail]           = useState(USE_MOCK ? DEMO_EMAILS.admin : '');
  const [password, setPassword]     = useState(USE_MOCK ? 'password' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleRolePick = (r) => {
    setRole(r);
    setEmail(DEMO_EMAILS[r]);
    setError('');
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (USE_MOCK) {
        const user = MOCK_USERS[role];
        login('mock-token-' + role, user);
        navigate('/dashboard', { replace: true });
      } else {
        const res = await apiLogin(email, password);
        login(res.data.token, res.data.user);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

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
          <h2>Manage your fleet with precision.</h2>
          <p>Centralised driver operations, task assignment, and reporting — built for logistics teams that move fast.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <h1 className={styles.heading}>Sign in</h1>
          <p className={styles.subheading}>Access your role-based dashboard</p>

          {USE_MOCK && (
            <div className={styles.roleToggle}>
              {['admin', 'partner', 'driver'].map((r) => (
                <button
                  key={r}
                  className={`${styles.roleBtn} ${role === r ? styles.roleActive : ''}`}
                  onClick={() => handleRolePick(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          )}

          {error && <div className={styles.errorMsg}>{error}</div>}

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
                autoComplete="current-password"
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
          </div>

          <button
            className={styles.loginBtn}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in to dashboard'}
          </button>

          <div className={styles.mockNotice}>
            Don't have an account? <Link to="/register">Create one</Link>
          </div>

          {USE_MOCK && (
            <div className={styles.mockNotice}>
              <strong>Demo mode</strong> — using mock data. Set <code>VITE_USE_MOCK=false</code> in <code>.env</code> to connect to the live backend.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}