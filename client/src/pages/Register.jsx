import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import API_URL from '../api';
import { useAuth } from '../context/AuthContext';

const isStrongPassword = password =>
  password.length >= 10 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    name: '',
    password: ''
  });

  const handleSendOtp = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = formData.email.trim().toLowerCase();

    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, { email, type: 'REGISTER' });
      setFormData(prev => ({ ...prev, email }));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = formData.otp.trim();

    if (!/^\d{4}$/.test(otp)) {
      setError('Enter the 4-digit OTP sent to your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp
      });

      setVerificationToken(res.data.verificationToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.msg || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalRegister = async e => {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError('Use at least 10 characters with uppercase, lowercase, a number and a special character.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        verificationToken
      });

      login(res.data.token, Boolean(res.data.isAdmin));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section auth-register-page">
      <div className="auth-register-card">
        <span className="eyebrow">START A FUNDRAISER</span>
        <h1>Create your fundraiser account</h1>
        <p className="auth-muted">
          {step === 1 ? 'Step 1 of 3 · Email verification' : step === 2 ? 'Step 2 of 3 · Verify OTP' : 'Step 3 of 3 · Secure your account'}
        </p>
        <div className="step-progress" aria-label={`Registration step ${step} of 3`}>
          <div style={{ width: `${step * 33.333}%` }} />
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label className="auth-field">
              Email address
              <input className="form-input" type="email" autoComplete="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </label>
            <button disabled={loading} className="primary-button full">{loading ? 'Sending OTP…' : 'Send OTP'}</button>
            <p className="auth-footer-copy">Already registered? <Link to="/login">Log in</Link></p>
          </form>
        )}

        {step === 2 && (
          <div>
            <label className="auth-field">
              4-digit OTP
              <input className="form-input otp-input" type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength="4" value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })} />
            </label>
            <button type="button" disabled={loading} onClick={handleVerifyOtp} className="primary-button full">{loading ? 'Verifying…' : 'Verify code'}</button>
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="text-button">Change email</button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalRegister}>
            <label className="auth-field">
              Full name
              <input className="form-input" type="text" autoComplete="name" required minLength="2" maxLength="80" placeholder="Your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </label>

            <label className="auth-field">
              Password
              <input className="form-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength="10" placeholder="Create a strong password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </label>

            <div className="password-hint">10+ characters · uppercase · lowercase · number · special character</div>

            <label className="checkbox-row password-toggle">
              <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
              Show password
            </label>

            <button disabled={loading} className="primary-button full">{loading ? 'Creating…' : 'Complete registration'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
