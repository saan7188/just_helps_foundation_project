import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

import API_URL from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      setError('Enter your email first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, {
        email: formData.email.trim().toLowerCase(),
        type: 'LOGIN'
      });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const res = useOtp
        ? await axios.post(`${API_URL}/api/auth/login-with-otp`, { email, otp: formData.otp.trim() })
        : await axios.post(`${API_URL}/api/auth/login`, { email, password: formData.password });

      login(res.data.token, Boolean(res.data.isAdmin));
      navigate(res.data.isAdmin ? '/admin' : (location.state?.from || '/dashboard'), { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-split-page">
      <section className="login-image-panel" aria-hidden="true">
        <div className="login-image-overlay" />
        <div className="login-image-copy">
          <span className="eyebrow">JUST HELPS</span>
          <h1>Bring a real need to the people who can help.</h1>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">FUNDRAISER ACCESS</span>
          <h2>Welcome back</h2>
          <p className="auth-muted">Manage your campaigns and track their progress.</p>

          {location.state?.message && <div className="form-success" role="status">{location.state.message}</div>}
          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="auth-mode-switch" role="tablist" aria-label="Login method">
            <button type="button" role="tab" aria-selected={!useOtp} className={!useOtp ? 'active' : ''} onClick={() => { setUseOtp(false); setOtpSent(false); setError(''); }}>Password</button>
            <button type="button" role="tab" aria-selected={useOtp} className={useOtp ? 'active' : ''} onClick={() => { setUseOtp(true); setOtpSent(false); setError(''); }}>Email OTP</button>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="auth-field">
              Email address
              <input className="form-input" type="email" autoComplete="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </label>

            {!useOtp && (
              <label className="auth-field">
                <span className="field-label-row"><span>Password</span><Link to="/forgot-password">Forgot password?</Link></span>
                <input className="form-input" type="password" autoComplete="current-password" required placeholder="Your password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </label>
            )}

            {useOtp && !otpSent && (
              <button type="button" onClick={handleSendOtp} disabled={loading} className="secondary-button full auth-secondary-action">{loading ? 'Sending…' : 'Send login OTP'}</button>
            )}

            {useOtp && otpSent && (
              <label className="auth-field">
                4-digit OTP
                <input className="form-input otp-input" type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength="4" value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })} />
              </label>
            )}

            {(!useOtp || otpSent) && (
              <button disabled={loading} type="submit" className="primary-button full">{loading ? 'Signing in…' : 'Sign in'}</button>
            )}
          </form>

          <p className="auth-footer-copy">Need an account? <Link to="/register">Start a fundraiser</Link></p>
        </div>
      </section>
    </main>
  );
}
