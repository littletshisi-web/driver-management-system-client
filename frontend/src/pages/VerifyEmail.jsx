import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/authApi.js';
import styles from './Register.module.css'; // reuse the auth page styling

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.right} style={{ width: '100%' }}>
        <div className={styles.formWrap}>
          <h1 className={styles.heading}>
            {status === 'verifying' && 'Verifying your email…'}
            {status === 'success' && 'Email verified!'}
            {status === 'error' && 'Verification failed'}
          </h1>
          <p className={styles.subheading}>{message}</p>

          {status === 'success' && (
            <Link to="/login" className={styles.loginBtn} style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
              Go to login
            </Link>
          )}

          {status === 'error' && (
            <Link to="/login" className={styles.mockNotice}>
              Back to login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}